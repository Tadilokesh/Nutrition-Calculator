// src/index.js

const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
const { parseNutritionDatabase, parseHouseholdMeasurements } = require('./utils/nutritionParser');
const NutritionEstimator = require('./nutritionEstimator');

// Import data from files or use defaults
const nutritionDB = require('../data/nutrition_db');
const householdMeasurements = require('../data/household_measurements');
const unitConversions = require('../data/unit_conversions');
const ingredientDensity = require('../data/ingredient_density');
const ingredientMappings = require('../data/ingredient_mappings');
const foodTypeClassification = require('../data/food_type_classification');

// Add this at the top of src/index.js
try {
    const IngredientStandardizer = require('./services/ingredientStandardizer');
    console.log("IngredientStandardizer loaded successfully");
  } catch (error) {
    console.error("Error loading IngredientStandardizer:", error.message);
  }
  
/**
 * Initialize the nutrition estimator
 * @param {boolean} useApi - Whether to use API for recipe fetching
 * @returns {NutritionEstimator} - Initialized estimator
 */
function initializeEstimator(useApi = false) {
  return new NutritionEstimator(
    nutritionDB,
    householdMeasurements,
    unitConversions,
    ingredientDensity,
    ingredientMappings,
    foodTypeClassification,
    useApi
  );
}

/**
 * Process a list of dishes
 * @param {Array<string>} dishes - List of dish names
 * @returns {Promise<Array<Object>>} - Nutrition info for each dish
 */
async function processDishes(dishes) {
  const estimator = initializeEstimator(false); // Set to true to use OpenAI API
  const results = [];
  
  for (const dish of dishes) {
    logger.info(`Processing dish: ${dish}`);
    const result = await estimator.estimateNutrition(dish);
    results.push(result);
    console.log(`\nResults for ${dish}:`);
    console.log(JSON.stringify(result, null, 2));
  }
  
  return results;
}

/**
 * Main function
 */
async function main() {
  // Test with a few dishes
  const testDishes = [
    "Paneer Butter Masala",
    "Dal Makhani",
    "Chole Bhature",
    "Palak Paneer",
    "Aloo Gobi"
  ];
  
  try {
    const results = await processDishes(testDishes);
    
    // Save results to file
    fs.writeFileSync(
      path.join(__dirname, '../nutrition_results.json'),
      JSON.stringify(results, null, 2)
    );
    
    console.log("\nResults saved to nutrition_results.json");
  } catch (error) {
    logger.error(`Error in main execution: ${error.message}`);
    console.error('An error occurred:', error.message);
  }
}

// Run main if called directly
if (require.main === module) {
  main().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}

// Export for use as a module
module.exports = {
  initializeEstimator,
  processDishes
};