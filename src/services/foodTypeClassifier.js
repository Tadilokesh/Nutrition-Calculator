// src/services/foodTypeClassifier.js

const logger = require('../utils/logger');

/**
 * Service to classify dishes into food types
 */
class FoodTypeClassifier {
  /**
   * @param {Object} classificationRules - Dictionary mapping keywords to food types
   */
  constructor(classificationRules) {
    this.classificationRules = classificationRules;
  }

  /**
   * Classify a dish into a food type
   * @param {string} dishName - Name of the dish
   * @param {Array} ingredients - List of standardized ingredients
   * @returns {string} - Food type
   */
  classifyDish(dishName, ingredients) {
    const normalizedDishName = dishName.toLowerCase();
    
    // Check classification rules based on dish name
    for (const [keyword, foodType] of Object.entries(this.classificationRules)) {
      if (normalizedDishName.includes(keyword)) {
        logger.info(`Classified ${dishName} as ${foodType} based on name`);
        return foodType;
      }
    }
    
    // If no match by name, try to infer from ingredients
    let hasGravy = false;
    const mainIngredients = [];
    
    for (const ingredient of ingredients) {
      const stdName = ingredient.standardized_ingredient;
      
      // Check for gravy indicators
      if (stdName.includes('tomato') || stdName.includes('onion') || 
          stdName.includes('cream') || stdName.includes('coconut milk')) {
        hasGravy = true;
      }
      
      // Identify main ingredients (those with significant quantity)
      if (ingredient.standardized_quantity_g > 100) {
        mainIngredients.push(stdName);
      }
    }
    
    // Classification logic based on main ingredients
    if (mainIngredients.some(ing => ['chicken', 'mutton', 'fish', 'egg'].some(meat => ing.includes(meat)))) {
      return hasGravy ? "Non - Veg Gravy" : "Non - Veg Fry";
    }
    
    if (mainIngredients.some(ing => ing.includes('dal') || ing.includes('lentil'))) {
      return "Dals";
    }
    
    if (mainIngredients.some(ing => ing.includes('rice'))) {
      return "Wet Rice Item";
    }
    
    if (mainIngredients.some(ing => ing.includes('paneer'))) {
      return hasGravy ? "Veg Gravy" : "Veg Fry";
    }
    
    // Default case
    return hasGravy ? "Veg Gravy" : "Veg Fry";
  }
}

module.exports = FoodTypeClassifier;