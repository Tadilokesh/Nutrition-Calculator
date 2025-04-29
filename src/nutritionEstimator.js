// src/nutritionEstimator.js

const logger = require('./utils/logger');
const RecipeFetcher = require('./services/recipeFetcher');
const IngredientStandardizer = require('./services/ingredientStandardizer');
const NutritionCalculator = require('./services/nutritionCalculator');
const FoodTypeClassifier = require('./services/foodTypeClassifier');
const ServingSizeExtrapolator = require('./services/servingSizeExtrapolator');

/**
 * Main controller to orchestrate the nutrition estimation process
 */
class NutritionEstimator {
  /**
   * @param {Object} nutritionDB - Nutrition database
   * @param {Object} householdMeasurements - Household measurement data
   * @param {Object} unitConversions - Unit conversion data
   * @param {Object} ingredientDensity - Ingredient density data
   * @param {Object} ingredientMappings - Ingredient mapping data
   * @param {Object} classificationRules - Food type classification rules
   * @param {boolean} useApi - Whether to use API for recipe fetching
   */
  constructor(
    nutritionDB,
    householdMeasurements,
    unitConversions,
    ingredientDensity,
    ingredientMappings,
    classificationRules,
    useApi = false
  ) {
    this.recipeFetcher = new RecipeFetcher(useApi);
    this.ingredientStandardizer = new IngredientStandardizer(
      nutritionDB,
      ingredientDensity,
      unitConversions,
      ingredientMappings
    );
    this.nutritionCalculator = new NutritionCalculator(nutritionDB);
    this.foodTypeClassifier = new FoodTypeClassifier(classificationRules);
    this.servingExtrapolator = new ServingSizeExtrapolator(householdMeasurements);
  }

  /**
   * Estimate nutrition for a dish
   * @param {string} dishName - Name of the dish
   * @returns {Promise<Object>} - Dictionary with nutrition info
   */
  async estimateNutrition(dishName) {
    try {
      // Step 1: Fetch recipe
      logger.info(`Estimating nutrition for: ${dishName}`);
      const rawIngredients = await this.recipeFetcher.fetchRecipe(dishName);
      
      // Step 2: Standardize ingredients
      const standardizedIngredients = [];
      for (const ingredientData of rawIngredients) {
        const standardized = this.ingredientStandardizer.standardizeIngredient(ingredientData);
        standardizedIngredients.push(standardized);
      }
      
      // Step 3: Calculate total nutrition
      const totalNutrition = this.nutritionCalculator.calculateTotalNutrition(standardizedIngredients);
      
      // Step 4: Classify food type
      const foodType = this.foodTypeClassifier.classifyDish(dishName, standardizedIngredients);
      
      // Step 5: Calculate total weight
      const totalWeightG = standardizedIngredients.reduce(
        (sum, item) => sum + item.standardized_quantity_g, 
        0
      );
      
      // Step 6: Extrapolate to standard serving
      const servingInfo = this.servingExtrapolator.extrapolateToServing(
        totalNutrition,
        foodType,
        totalWeightG
      );
      
      // Prepare the output
      const output = {
        dish_name: dishName,
        dish_type: foodType,
        [`estimated_nutrition_per_${servingInfo.serving_unit}`]: servingInfo.nutrition,
        ingredients_used: standardizedIngredients.map(item => ({
          ingredient: item.raw_ingredient,
          quantity: item.standardized_household_measure
        })),
        total_dish_weight_g: totalWeightG,
        serving_size_g: servingInfo.serving_size_g
      };
      
      logger.info(`Successfully estimated nutrition for ${dishName}`);
      return output;
      
    } catch (error) {
      logger.error(`Error estimating nutrition for ${dishName}: ${error.message}`);
      // Return a partial result with error info
      return {
        dish_name: dishName,
        error: error.message,
        dish_type: "Unknown",
        estimated_nutrition_per_serving: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0
        },
        ingredients_used: []
      };
    }
  }
}

module.exports = NutritionEstimator;