// src/utils/nutritionParser.js

const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Parse the nutrition database TSV file and convert it to a usable format
 * @param {string} filePath - Path to the TSV file containing nutrition data
 * @returns {Object} - Parsed nutrition database
 */
function parseNutritionDatabase(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');
    
    // Extract header line and find index of important columns
    const headers = lines[0].split('\t');
    
    // Find column indexes for key nutritional values
    const foodNameIndex = headers.indexOf('food_name');
    const caloriesIndex = headers.indexOf('energy_kcal');
    const proteinIndex = headers.indexOf('protein_g');
    const carbsIndex = headers.indexOf('carb_g');
    const fatIndex = headers.indexOf('fat_g');
    const fiberIndex = headers.indexOf('fibre_g');
    
    // Check if all required columns are found
    if ([foodNameIndex, caloriesIndex, proteinIndex, carbsIndex, fatIndex, fiberIndex].includes(-1)) {
      throw new Error('Required columns not found in nutrition database file');
    }
    
    // Process each line and build the nutrition database
    const nutritionDB = {};
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      const columns = line.split('\t');
      
      // Get the food name and convert to lowercase for consistency
      const foodName = columns[foodNameIndex].toLowerCase().trim();
      
      // Some food entries might have multiple values separated by commas or be in parentheses
      // Extract the main name without qualifiers
      const mainFoodName = foodName.split(',')[0].split('(')[0].trim();
      
      if (!mainFoodName) continue; // Skip if no valid food name
      
      // Parse nutritional values, defaulting to 0 if value is missing or not a number
      const parseValue = (index) => {
        const value = parseFloat(columns[index]);
        return isNaN(value) ? 0 : value;
      };
      
      nutritionDB[mainFoodName] = {
        calories: parseValue(caloriesIndex),
        protein: parseValue(proteinIndex),
        carbs: parseValue(carbsIndex),
        fat: parseValue(fatIndex),
        fiber: parseValue(fiberIndex)
      };
    }
    
    logger.info(`Successfully parsed nutrition database with ${Object.keys(nutritionDB).length} entries`);
    return nutritionDB;
  } catch (error) {
    logger.error(`Error parsing nutrition database: ${error.message}`);
    // Return a minimal default database if parsing fails
    return {
      "rice": { calories: 350, protein: 7, carbs: 78, fat: 0.5, fiber: 2.8 },
      "wheat": { calories: 320, protein: 10.6, carbs: 64.7, fat: 1.5, fiber: 11.2 },
      "paneer": { calories: 265, protein: 18.3, carbs: 3.1, fat: 20.8, fiber: 0 },
      "potato": { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 1.5 },
      "tomato": { calories: 20, protein: 0.9, carbs: 4.3, fat: 0.2, fiber: 1.2 },
      "onion": { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 }
    };
  }
}

/**
 * Parse the household measurements data
 * @param {string} filePath - Path to the file containing household measurements data
 * @returns {Object} - Parsed household measurements
 */
function parseHouseholdMeasurements(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');
    
    // Expect a simple format: Category,Unit,Weight
    const householdMeasurements = {};
    
    for (let i = 1; i < lines.length; i++) { // Skip header
      const line = lines[i].trim();
      if (!line) continue;
      
      const [category, unit, weight] = line.split(',').map(item => item.trim());
      
      if (category && unit && weight) {
        // Convert weight to number
        const weightValue = parseFloat(weight);
        
        if (!isNaN(weightValue)) {
          if (!householdMeasurements[category]) {
            householdMeasurements[category] = {};
          }
          householdMeasurements[category][unit.toLowerCase()] = weightValue;
        }
      }
    }
    
    logger.info(`Successfully parsed household measurements for ${Object.keys(householdMeasurements).length} categories`);
    return householdMeasurements;
  } catch (error) {
    logger.error(`Error parsing household measurements: ${error.message}`);
    // Return data from the assignment if parsing fails
    return {
      "Dry Rice Item": { "katori": 124 },
      "Wet Rice Item": { "katori": 150 },
      "Veg Gravy": { "katori": 150 },
      "Veg Fry": { "katori": 100 },
      "Non - Veg Gravy": { "katori": 150 },
      "Non - Veg Fry": { "katori": 100 },
      "Dals": { "katori": 150 },
      "Wet Breakfast Item": { "katori": 130 },
      "Dry Breakfast Item": { "katori": 100 },
      "Chutneys": { "tbsp": 15 },
      "Plain Flatbreads": { "piece": 50 },
      "Stuffed Flatbreads": { "piece": 100 },
      "Salads": { "katori": 100 },
      "Raita": { "katori": 150 },
      "Plain Soups": { "katori": 150 },
      "Mixed Soups": { "cup": 250 },
      "Hot Beverages": { "cup": 250 },
      "Beverages": { "cup": 250 },
      "Snacks": { "katori": 100 },
      "Sweets": { "katori": 120 }
    };
  }
}

module.exports = {
  parseNutritionDatabase,
  parseHouseholdMeasurements
};