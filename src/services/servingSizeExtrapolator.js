// src/services/servingSizeExtrapolator.js

const logger = require('../utils/logger');

/**
 * Service to extrapolate nutrition for standard serving sizes
 */
class ServingSizeExtrapolator {
  /**
   * @param {Object} householdMeasurements - Dictionary mapping food types to standard serving sizes
   */
  constructor(householdMeasurements) {
    this.householdMeasurements = householdMeasurements;
  }

  /**
   * Extrapolate nutrition to standard serving size
   * @param {Object} totalNutrition - Total nutrition for the entire dish
   * @param {string} foodType - Classified food type
   * @param {number} totalWeightG - Total weight of the dish in grams
   * @returns {Object} - Nutrition per standard serving with metadata
   */
  extrapolateToServing(totalNutrition, foodType, totalWeightG) {
    // Get standard serving size for this food type
    let servingUnit, servingSizeG;
    
    if (this.householdMeasurements[foodType]) {
      // Get the first unit and its size (e.g., "katori": 150)
      const units = Object.keys(this.householdMeasurements[foodType]);
      servingUnit = units[0];
      servingSizeG = this.householdMeasurements[foodType][servingUnit];
    } else {
      // Default to a standard serving if food type not found
      logger.warn(`No standard serving size for ${foodType}, using default of 100g`);
      servingUnit = "serving";
      servingSizeG = 100;
    }
    
    // Assume the recipe is for 3-4 people as mentioned in the assignment
    // So total dish weight should be 3-4 times the standard serving
    const expectedTotalWeightG = servingSizeG * 4; // Assuming 4 servings
    
    // If our calculated total weight differs significantly from expected,
    // log a warning but proceed with the calculation
    if (totalWeightG < expectedTotalWeightG * 0.5 || totalWeightG > expectedTotalWeightG * 2) {
      logger.warn(`Calculated total weight (${totalWeightG}g) differs significantly from expected weight for 4 servings (${expectedTotalWeightG}g)`);
    }
    
    // Calculate nutrition per serving
    const servingNutrition = {};
    const servingRatio = servingSizeG / totalWeightG;
    
    for (const [nutrient, value] of Object.entries(totalNutrition)) {
      servingNutrition[nutrient] = Math.round(value * servingRatio * 10) / 10;
    }
    
    return {
      nutrition: servingNutrition,
      serving_unit: servingUnit,
      serving_size_g: servingSizeG
    };
  }
}

module.exports = ServingSizeExtrapolator;