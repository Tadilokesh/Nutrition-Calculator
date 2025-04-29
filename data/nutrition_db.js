// Create data directory structure
// mkdir -p data/

// Save this as data/nutrition_db.js
const nutritionDB = {
    // This will be populated from the IFCT-2017 data
    // Sample structure based on the provided data
    "paneer": {
      "calories": 265,
      "protein": 18.3,
      "carbs": 3.1,
      "fat": 20.8,
      "fiber": 0
    },
    "butter": {
      "calories": 722,
      "protein": 0.1,
      "carbs": 0.1,
      "fat": 81.1,
      "fiber": 0
    },
    "tomato": {
      "calories": 20,
      "protein": 0.9,
      "carbs": 4.3,
      "fat": 0.2,
      "fiber": 1.2
    },
    // Add more ingredients as needed
  };
  
  module.exports = nutritionDB;
  
  // Save this as data/household_measurements.js
  const householdMeasurements = {
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
  
  module.exports = householdMeasurements;
  
  // Save this as data/unit_conversions.js
  const unitConversions = {
    "cup": 150,   // ml
    "katori": 150, // ml
    "glass": 250,  // ml
    "teaspoon": 5, // ml
    "tsp": 5,      // ml
    "tablespoon": 15, // ml
    "tbsp": 15,    // ml
    "teacup": 100  // ml
  };
  
  module.exports = unitConversions;
  
  // Save this as data/ingredient_density.js
  const ingredientDensity = {
    // Density in g/ml for converting volume to weight
    "water": 1.0,
    "milk": 1.03,
    "oil": 0.92,
    "ghee": 0.91,
    "butter": 0.96,
    "flour": 0.53,
    "rice": 0.75,
    "sugar": 0.85,
    "salt": 1.38,
    "paneer": 0.75,
    "tomato puree": 1.03,
    "chopped onion": 0.45,
    "cream": 0.98,
    "dal": 0.85,
    "lentil": 0.85
    // Add more ingredients as needed
  };
  
  module.exports = ingredientDensity;
  
  // Save this as data/ingredient_mappings.js
  const ingredientMappings = {
    // Map ingredient synonyms to standardized names that match the nutrition database
    "tomatoes": "tomato",
    "tomato": "tomato",
    "onions": "onion",
    "onion": "onion",
    "paneer cubes": "paneer",
    "paneer": "paneer",
    "tomato puree": "tomato",
    "butter": "butter",
    "coriander leaves": "coriander",
    "coriander powder": "coriander powder",
    "red chilli powder": "red chilli powder",
    "green chilli": "green chilli"
    // Add more mappings as needed
  };
  
  module.exports = ingredientMappings;
  
  // Save this as data/food_type_classification.js
  const foodTypeClassification = {
    // Keywords to classify dishes into food types
    "curry": "Veg Gravy",
    "masala": "Veg Gravy",
    "sabzi": "Veg Fry",
    "dal": "Dals",
    "rice": "Wet Rice Item",
    "pulao": "Wet Rice Item",
    "biryani": "Wet Rice Item",
    "roti": "Plain Flatbreads",
    "paratha": "Stuffed Flatbreads",
    "chicken": "Non - Veg Gravy",
    "mutton": "Non - Veg Gravy",
    "fish": "Non - Veg Gravy",
    "paneer": "Veg Gravy"
    // Add more classifications as needed
  };
  
  module.exports = foodTypeClassification;