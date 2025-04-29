// src/services/ingredientStandardizer.js

const logger = require('../utils/logger');

/**
 * Service to standardize ingredient names and quantities
 */
class IngredientStandardizer {
  /**
   * @param {Objectmodule.exports = IngredientStandardizer; nutritionDB - Nutrition database
   * @param {Object} ingredientDensity - Ingredient density mapping
   * @param {Object} unitConversions - Unit conversion mapping
   * @param {Object} ingredientMappings - Ingredient synonym mappings
   */
  constructor(nutritionDB, ingredientDensity, unitConversions, ingredientMappings) {
    this.nutritionDB = nutritionDB;
    this.ingredientDensity = ingredientDensity;
    this.unitConversions = unitConversions;
    this.ingredientMappings = ingredientMappings;
  }

  /**
   * Standardize ingredient name to match database entries
   * @param {string} name - Raw ingredient name
   * @returns {string} - Standardized ingredient name
   */
  standardizeIngredientName(name) {
    const normalizedName = name.toLowerCase().trim();
    
    // Check if the exact name exists in the database
    if (this.nutritionDB[normalizedName]) {
      return normalizedName;
    }
    
    // Check if a mapping exists
    if (this.ingredientMappings[normalizedName]) {
      return this.ingredientMappings[normalizedName];
    }
    
    // Try to find a match in the nutrition database (partial match)
    for (const dbIngredient of Object.keys(this.nutritionDB)) {
      // Check if the database ingredient name contains or is contained in the input name
      if (normalizedName.includes(dbIngredient) || dbIngredient.includes(normalizedName)) {
        logger.info(`Mapped '${normalizedName}' to '${dbIngredient}'`);
        return dbIngredient;
      }
    }
    
    // Try stemming/simplification (e.g., remove adjectives)
    const words = normalizedName.split(' ');
    if (words.length > 1) {
      for (const word of words) {
        if (this.nutritionDB[word]) {
          logger.info(`Mapped '${normalizedName}' to '${word}'`);
          return word;
        }
      }
      
      // Try the last word (often the main ingredient)
      const lastWord = words[words.length - 1];
      if (this.nutritionDB[lastWord]) {
        logger.info(`Mapped '${normalizedName}' to '${lastWord}'`);
        return lastWord;
      }
    }
    
    // If all else fails, return the original name and log it
    logger.warn(`Could not standardize ingredient name: ${normalizedName}`);
    return normalizedName;
  }

  /**
   * Parse quantity string into a numeric value and unit
   * @param {string} quantityStr - Raw quantity string (e.g., "2 tbsp", "250g")
   * @returns {Object} - Parsed quantity with value and unit
   */
  parseQuantity(quantityStr) {
    const normalizedQuantity = quantityStr.toLowerCase().trim();
    
    // Handle "to taste" case
    if (normalizedQuantity.includes('to taste')) {
      return { value: 1, unit: 'pinch' };
    }
    
    // Handle numeric fractions like "1/2"
    if (normalizedQuantity.includes('/')) {
      const fractionMatch = normalizedQuantity.match(/([\d]+)\/([\d]+)/);
      if (fractionMatch) {
        const [_, numerator, denominator] = fractionMatch;
        const fractionValue = parseInt(numerator) / parseInt(denominator);
        
        // Extract the unit part
        const unitPart = normalizedQuantity.replace(fractionMatch[0], '').trim();
        const unit = this.extractUnit(unitPart);
        
        return { value: fractionValue, unit };
      }
    }
    
    // Extract numeric value using regex
    const numericMatch = normalizedQuantity.match(/([\d.]+)/);
    if (!numericMatch) {
      logger.warn(`Could not parse quantity: ${quantityStr}, assuming 1.0`);
      return { value: 1, unit: 'piece' };
    }
    
    const value = parseFloat(numericMatch[1]);
    
    // Extract unit part
    const unitPart = normalizedQuantity.replace(numericMatch[0], '').trim();
    const unit = this.extractUnit(unitPart);
    
    return { value, unit };
  }

  /**
   * Extract and standardize unit from a string
   * @param {string} unitStr - String possibly containing a unit
   * @returns {string} - Standardized unit
   */
  extractUnit(unitStr) {
    // Common unit mappings
    const unitMap = {
      'tbsp': 'tablespoon',
      'tablespoon': 'tablespoon',
      'tablespoons': 'tablespoon',
      'tsp': 'teaspoon',
      'teaspoon': 'teaspoon',
      'teaspoons': 'teaspoon',
      'cup': 'cup',
      'cups': 'cup',
      'katori': 'katori',
      'glass': 'glass',
      'glasses': 'glass',
      'ml': 'ml',
      'milliliter': 'ml',
      'milliliters': 'ml',
      'g': 'g',
      'gram': 'g',
      'grams': 'g',
      'kg': 'kg',
      'kilogram': 'kg',
      'kilograms': 'kg',
      'l': 'liter',
      'liter': 'liter',
      'liters': 'liter',
      'medium': 'medium',
      'large': 'large',
      'small': 'small',
      'piece': 'piece',
      'pieces': 'piece',
      'pinch': 'pinch',
      'inch': 'inch'
    };
    
    // Check for unit keywords in the string
    for (const [keyword, standardUnit] of Object.entries(unitMap)) {
      if (unitStr.includes(keyword)) {
        return standardUnit;
      }
    }
    
    // Special case for units attached directly to numbers (e.g., "250g")
    if (unitStr.includes('g') && !unitStr.includes('kg')) {
      return 'g';
    }
    if (unitStr.includes('ml')) {
      return 'ml';
    }
    
    // Check if it's a size descriptor
    if (['small', 'medium', 'large'].some(size => unitStr.includes(size))) {
      for (const size of ['small', 'medium', 'large']) {
        if (unitStr.includes(size)) {
          return size;
        }
      }
    }
    
    // Default case - if no unit is found, make an educated guess
    if (unitStr.includes('clove')) {
      return 'piece';
    }
    if (unitStr.includes('piece') || unitStr.includes('whole')) {
      return 'piece';
    }
    
    // Final fallback
    return 'piece';
  }

  /**
   * Convert a quantity to grams
   * @param {number} value - Numeric value
   * @param {string} unit - Unit (e.g., "tablespoon", "cup")
   * @param {string} ingredient - Ingredient name
   * @returns {number} - Quantity in grams
   */
  convertToGrams(value, unit, ingredient) {
    // If already in grams, return as is
    if (unit === 'g') {
      return value;
    }
    
    // If in kg, convert to grams
    if (unit === 'kg') {
      return value * 1000;
    }
    
    // Handle volume units (convert to ml first, then use density)
    if (this.unitConversions[unit]) {
      const volumeMl = value * this.unitConversions[unit];
      
      // Find the best density match
      let bestMatch = null;
      for (const densityKey of Object.keys(this.ingredientDensity)) {
        if (ingredient.includes(densityKey)) {
          bestMatch = densityKey;
          break;
        }
      }
      
      if (bestMatch) {
        const density = this.ingredientDensity[bestMatch];
        return volumeMl * density;
      } else {
        // Default density if no match (assume water-like density)
        logger.warn(`No density information for ${ingredient}, using default of 1.0 g/ml`);
        return volumeMl * 1.0;
      }
    }
    
    // Handle piece/count units with estimated weights
    if (['piece', 'medium', 'large', 'small'].includes(unit)) {
      // Estimated weights for common ingredients by count/size
      const countWeights = {
        'tomato': { 'small': 75, 'medium': 125, 'large': 175, 'piece': 125 },
        'onion': { 'small': 60, 'medium': 110, 'large': 150, 'piece': 110 },
        'potato': { 'small': 100, 'medium': 150, 'large': 200, 'piece': 150 },
        'garlic': { 'clove': 5, 'piece': 5, 'small': 4, 'medium': 5, 'large': 6 },
        'ginger': { 'inch': 15, 'piece': 15, 'small': 10, 'medium': 15, 'large': 20 },
        'green chilli': { 'piece': 10, 'small': 8, 'medium': 10, 'large': 12 },
        'lemon': { 'piece': 60, 'small': 50, 'medium': 60, 'large': 70 },
        'carrot': { 'piece': 60, 'small': 50, 'medium': 60, 'large': 80 }
      };
      
      // Find the best ingredient match
      let bestMatch = null;
      for (const ing of Object.keys(countWeights)) {
        if (ingredient.includes(ing)) {
          bestMatch = ing;
          break;
        }
      }
      
      if (bestMatch) {
        return value * (countWeights[bestMatch][unit] || countWeights[bestMatch]['piece']);
      } else {
        // Default weights if no match
        const defaultWeights = { 'small': 50, 'medium': 100, 'large': 150, 'piece': 100 };
        logger.warn(`No count weight for ${ingredient} ${unit}, using default`);
        return value * (defaultWeights[unit] || 100);
      }
    }
    
    // Handle pinch for spices
    if (unit === 'pinch') {
      if (ingredient.includes('salt') || ingredient.includes('powder') || 
          ingredient.includes('masala') || ingredient.includes('spice')) {
        return value * 1; // 1g per pinch for spices
      }
      return value * 0.5; // Default pinch
    }
    
    // Default case - log warning and make a reasonable assumption
    logger.warn(`Unhandled unit conversion: ${value} ${unit} of ${ingredient}, assuming 10g`);
    return value * 10;
  }

  /**
   * Convert grams to household measurements
   * @param {number} grams - Quantity in grams
   * @param {string} ingredient - Ingredient name
   * @returns {string} - String representation in household measures
   */
  convertToHouseholdMeasure(grams, ingredient) {
    // Simple fixed conversions for common ingredients
    if (ingredient.includes('oil') || ingredient.includes('ghee') || ingredient.includes('butter')) {
      const density = this.ingredientDensity[ingredient] || 0.9;
      const teaspoons = grams / (density * 5);
      
      if (teaspoons < 3) {
        return `${teaspoons.toFixed(1)} teaspoons`;
      } else {
        const tablespoons = teaspoons / 3;
        return `${tablespoons.toFixed(1)} tablespoons`;
      }
    }
    
    // Volume-based ingredients
    if (ingredient.includes('milk') || ingredient.includes('water') || 
        ingredient.includes('juice') || ingredient.includes('cream')) {
      const density = this.ingredientDensity[ingredient] || 1.0;
      const ml = grams / density;
      
      if (ml < 30) {
        return `${(ml / 5).toFixed(1)} teaspoons`;
      } else if (ml < 100) {
        return `${(ml / 15).toFixed(1)} tablespoons`;
      } else if (ml < 500) {
        return `${(ml / 240).toFixed(2)} cups`;
      } else {
        return `${(ml / 1000).toFixed(2)} liters`;
      }
    }
    
    // Solid foods
    if (ingredient.includes('paneer')) {
      const cups = grams / 180;
      return `${cups.toFixed(2)} cup cubes`;
    }
    
    if (ingredient.includes('onion') || ingredient.includes('tomato')) {
      if (grams < 100) {
        return "small piece";
      } else if (grams < 150) {
        return "medium piece";
      } else {
        return "large piece";
      }
    }
    
    // Default
    if (grams < 10) {
      return `${grams.toFixed(1)} grams`;
    } else {
      return `${Math.round(grams)} grams`;
    }
  }

  /**
   * Standardize ingredient name and convert quantity to grams
   * @param {Object} ingredientData - Dictionary with 'ingredient' and 'quantity' keys
   * @returns {Object} - Dictionary with standardized ingredient info
   */
  standardizeIngredient(ingredientData) {
    const rawName = ingredientData.ingredient;
    const rawQuantity = ingredientData.quantity;
    
    const stdName = this.standardizeIngredientName(rawName);
    const { value, unit } = this.parseQuantity(rawQuantity);
    
    // Convert to grams
    const grams = this.convertToGrams(value, unit, stdName);
    
    return {
      raw_ingredient: rawName,
      standardized_ingredient: stdName,
      raw_quantity: rawQuantity,
      standardized_quantity_g: grams,
      standardized_household_measure: this.convertToHouseholdMeasure(grams, stdName)
    };
  }
}
module.exports = IngredientStandardizer;