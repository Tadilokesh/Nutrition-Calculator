// src/services/nutritionCalculator.js

const logger = require('../utils/logger');

/**
 * Service to calculate nutrition values for ingredients
 */
class NutritionCalculator {
  /**
   * @param {Object} nutritionDB - Nutrition database
   */
  constructor(nutritionDB) {
    this.nutritionDB = nutritionDB;
  }

  /**
   * Get nutrition values for an ingredient
   * @param {string} ingredient - Standardized ingredient name
   * @param {number} grams - Quantity in grams
   * @returns {Object} - Dictionary of nutrition values
   */
  getIngredientNutrition(ingredient, grams) {
    // Check if ingredient exists in database
    if (this.nutritionDB[ingredient]) {
      // Calculate nutrition based on grams (values in DB are per 100g)
      const result = {};
      for (const [nutrient, value] of Object.entries(this.nutritionDB[ingredient])) {
        result[nutrient] = (value * grams) / 100;
      }
      return result;
    }
    
    // Ingredient not found - log and provide default values
    logger.warn(`Ingredient '${ingredient}' not found in nutrition database`);
    
    // Estimate based on ingredient category
    if (ingredient.includes('oil') || ingredient.includes('ghee') || ingredient.includes('butter')) {
      return {
        calories: 9 * grams,
        protein: 0,
        carbs: 0,
        fat: grams,
        fiber: 0
      };
    }
    
    if (ingredient.includes('sugar') || ingredient.includes('jaggery')) {
      return {
        calories: 4 * grams,
        protein: 0,
        carbs: grams,
        fat: 0,
        fiber: 0
      };
    }
    
    if (ingredient.includes('salt') || ingredient.includes('spices')) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      };
    }
    
    // Very generic fallback
    return {
      calories: 2 * grams,  // Assuming 2 cal/g as a safe default
      protein: 0.05 * grams,
      carbs: 0.1 * grams,
      fat: 0.02 * grams,
      fiber: 0.01 * grams
    };
  }

  /**
   * Calculate total nutrition for a list of ingredients
   * @param {Array} ingredients - List of standardized ingredients with quantities
   * @returns {Object} - Dictionary of total nutrition values
   */
  calculateTotalNutrition(ingredients) {
    const totalNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    };
    
    for (const ingredient of ingredients) {
      const stdName = ingredient.standardized_ingredient;
      const grams = ingredient.standardized_quantity_g;
      
      // Get nutrition for this ingredient
      const nutrition = this.getIngredientNutrition(stdName, grams);
      
      // Add to total
      for (const nutrient of Object.keys(totalNutrition)) {
        if (nutrition[nutrient] !== undefined) {
          totalNutrition[nutrient] += nutrition[nutrient];
        }
      }
    }
    
    // Round values for better readability
    for (const nutrient of Object.keys(totalNutrition)) {
      totalNutrition[nutrient] = Math.round(totalNutrition[nutrient] * 10) / 10;
    }
    
    return totalNutrition;
  }
}

module.exports = NutritionCalculator;