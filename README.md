# Indian Dish Nutrition Calculator

A system to estimate the nutritional value of Indian dishes per standard serving.

## Problem Statement

This project addresses the challenge of estimating nutritional values for home-cooked Indian dishes, where traditional databases fall short due to household variations. The system:

1. Takes a dish name as input (e.g., "Paneer Butter Masala")
2. Fetches a generic recipe (ingredient list)
3. Converts ingredient quantities into standardized household measurements
4. Maps ingredients to a Nutrition Database
5. Standardizes quantities into grams
6. Calculates total nutrition values
7. Identifies the food type
8. Extrapolates nutrition for a standard serving size
9. Returns nutrition per standard serving

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/indian-dish-nutrition-calculator.git
cd indian-dish-nutrition-calculator

# Install dependencies
npm install
```

## Usage

### Command Line Interface

```bash
# Make the CLI executable
chmod +x ./cli.js

# Run the CLI
./cli.js
```

### As a Module

```javascript
const { initializeEstimator } = require('./src/index');

async function example() {
  const estimator = initializeEstimator();
  const result = await estimator.estimateNutrition('Paneer Butter Masala');
  console.log(result);
}

example();
```

## Assumptions Made

1. **Recipe Sources**: When an OpenAI API key is not provided, the system falls back to a small set of predefined recipes.
2. **Serving Size**: Following the assignment, recipes are assumed to be for 3-4 people.
3. **Ingredient Standardization**:
   - When an ingredient is not found in the database, the system attempts to map it to a similar ingredient.
   - For unknown ingredients, reasonable nutritional estimates are used based on category.
4. **Measurements**:
   - For unspecified quantities (e.g., "to taste"), minimal default values are used.
   - Standard conversion rates are used for volume to weight conversions.
5. **Food Classification**:
   - Classification is based on dish name keywords and ingredient composition.
   - Presence of liquid ingredients like tomato and onion in significant quantities indicates a gravy dish.

## Modularization Approach

The system is designed with a modular architecture for maintainability and extensibility:

1. **Data Management**:
   - Nutrition database and household measurements are loaded from data files.
   - Fallback values are provided if data loading fails.

2. **Core Services**:
   - `RecipeFetcher`: Retrieves recipes from OpenAI API or falls back to sample recipes.
   - `IngredientStandardizer`: Normalizes ingredient names and quantities.
   - `NutritionCalculator`: Maps ingredients to their nutritional values.
   - `FoodTypeClassifier`: Identifies the dish category.
   - `ServingSizeExtrapolator`: Calculates per-serving nutrition.

3. **Orchestration**:
   - `NutritionEstimator`: Coordinates the entire process.
   - `index.js`: Provides high-level functions for application use.
   - `cli.js`: Offers a command-line interface.

4. **Error Handling**:
   - Each module has robust error handling.
   - Reasonable fallbacks are used when data is missing or invalid.
   - Detailed logging helps diagnose issues.

## Test Examples

The system includes test examples for five common Indian dishes:

1. Paneer Butter Masala
2. Dal Makhani
3. Chole Bhature
4. Palak Paneer
5. Aloo Gobi

Results are saved to `nutrition_results.json` when running the main script.

## Future Improvements

1. Add a REST API interface for web applications
2. Enhance the ingredient mapping with more synonyms and variants
3. Improve recipe fetching with more sophisticated natural language processing
4. Implement a database for persistent storage of nutrition data
5. Add user profiles for personalized nutrition information

## License

MIT