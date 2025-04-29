// src/services/recipeFetcher.js

const axios = require('axios');
const logger = require('../utils/logger');
require('dotenv').config();

/**
 * Service to fetch recipe ingredients for a given dish
 */
class RecipeFetcher {
  constructor(useApi = true) {
    this.useApi = useApi;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    
    // Sample recipes for testing without API
    this.sampleRecipes = {
      "paneer butter masala": [
        { ingredient: "Paneer", quantity: "250g" },
        { ingredient: "Butter", quantity: "2 tbsp" },
        { ingredient: "Tomato", quantity: "3 medium" },
        { ingredient: "Onion", quantity: "1 large" },
        { ingredient: "Cream", quantity: "2 tbsp" },
        { ingredient: "Garam Masala", quantity: "1 tsp" },
        { ingredient: "Red Chilli Powder", quantity: "1 tsp" },
        { ingredient: "Turmeric Powder", quantity: "1/2 tsp" },
        { ingredient: "Salt", quantity: "to taste" }
      ],
      "dal makhani": [
        { ingredient: "Black Urad Dal", quantity: "1 cup" },
        { ingredient: "Rajma (Red Kidney Beans)", quantity: "1/4 cup" },
        { ingredient: "Onion", quantity: "1 medium" },
        { ingredient: "Tomato", quantity: "2 medium" },
        { ingredient: "Ginger", quantity: "1 inch piece" },
        { ingredient: "Garlic", quantity: "4-5 cloves" },
        { ingredient: "Green Chilli", quantity: "2" },
        { ingredient: "Butter", quantity: "2 tbsp" },
        { ingredient: "Cream", quantity: "2 tbsp" },
        { ingredient: "Garam Masala", quantity: "1 tsp" },
        { ingredient: "Cumin Seeds", quantity: "1 tsp" },
        { ingredient: "Salt", quantity: "to taste" }
      ],
      "chole bhature": [
        { ingredient: "Chickpeas (Chole)", quantity: "2 cups" },
        { ingredient: "Onion", quantity: "2 medium" },
        { ingredient: "Tomato", quantity: "3 medium" },
        { ingredient: "Ginger", quantity: "1 inch piece" },
        { ingredient: "Garlic", quantity: "5-6 cloves" },
        { ingredient: "Green Chilli", quantity: "2-3" },
        { ingredient: "Tea Bags", quantity: "1" },
        { ingredient: "Chole Masala", quantity: "2 tbsp" },
        { ingredient: "Cumin Seeds", quantity: "1 tsp" },
        { ingredient: "Dried Mango Powder (Amchur)", quantity: "1 tsp" },
        { ingredient: "All-Purpose Flour (Maida)", quantity: "2 cups" },
        { ingredient: "Yogurt", quantity: "1/4 cup" },
        { ingredient: "Baking Soda", quantity: "1/4 tsp" },
        { ingredient: "Oil", quantity: "for deep frying" },
        { ingredient: "Salt", quantity: "to taste" }
      ],
      "palak paneer": [
        { ingredient: "Spinach (Palak)", quantity: "500g" },
        { ingredient: "Paneer", quantity: "250g" },
        { ingredient: "Onion", quantity: "1 medium" },
        { ingredient: "Tomato", quantity: "1 medium" },
        { ingredient: "Ginger", quantity: "1 inch piece" },
        { ingredient: "Garlic", quantity: "4-5 cloves" },
        { ingredient: "Green Chilli", quantity: "2" },
        { ingredient: "Cream", quantity: "2 tbsp" },
        { ingredient: "Garam Masala", quantity: "1 tsp" },
        { ingredient: "Cumin Seeds", quantity: "1 tsp" },
        { ingredient: "Turmeric Powder", quantity: "1/2 tsp" },
        { ingredient: "Red Chilli Powder", quantity: "1 tsp" },
        { ingredient: "Salt", quantity: "to taste" }
      ],
      "aloo gobi": [
        { ingredient: "Potato", quantity: "2 medium" },
        { ingredient: "Cauliflower", quantity: "1 small" },
        { ingredient: "Onion", quantity: "1 medium" },
        { ingredient: "Tomato", quantity: "1 medium" },
        { ingredient: "Ginger", quantity: "1 inch piece" },
        { ingredient: "Garlic", quantity: "3-4 cloves" },
        { ingredient: "Green Chilli", quantity: "2" },
        { ingredient: "Cumin Seeds", quantity: "1 tsp" },
        { ingredient: "Turmeric Powder", quantity: "1/2 tsp" },
        { ingredient: "Red Chilli Powder", quantity: "1 tsp" },
        { ingredient: "Coriander Powder", quantity: "1 tsp" },
        { ingredient: "Garam Masala", quantity: "1/2 tsp" },
        { ingredient: "Salt", quantity: "to taste" }
      ]
    };
  }

  /**
   * Fetch recipe for a given dish
   * @param {string} dishName - Name of the dish
   * @returns {Promise<Array>} - List of ingredients with quantities
   */
  async fetchRecipe(dishName) {
    try {
      const normalizedDishName = dishName.toLowerCase().trim();
      
      // Return sample recipe if available (for testing without API)
      if (!this.useApi && this.sampleRecipes[normalizedDishName]) {
        logger.info(`Using sample recipe for ${dishName}`);
        return this.sampleRecipes[normalizedDishName];
      }
      
      if (this.useApi && this.openaiApiKey) {
        logger.info(`Fetching recipe for ${dishName} using OpenAI API`);
        
        // Make API request to OpenAI
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful cooking assistant that provides ingredient lists for Indian dishes.'
              },
              {
                role: 'user',
                content: `Give me just the ingredients list with approximate quantities for ${dishName}. Format as JSON array with 'ingredient' and 'quantity' fields.`
              }
            ]
          },
          {
            headers: {
              'Authorization': `Bearer ${this.openaiApiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Extract and parse JSON from the response
        const content = response.data.choices[0].message.content;
        
        try {
          // Try to parse the content as JSON
          return JSON.parse(content);
        } catch (parseError) {
          logger.warn(`Failed to parse JSON from API response, attempting manual parsing`);
          
          // Try to extract JSON array using regex
          const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
          
          // Last resort: manual parsing
          const lines = content.split('\n');
          const ingredients = [];
          
          for (const line of lines) {
            // Look for patterns like "Ingredient: Quantity" or "- Ingredient: Quantity"
            const match = line.match(/[-•]?\s*([^:]+):\s*(.+)/);
            if (match) {
              const ingredient = match[1].trim();
              const quantity = match[2].trim();
              ingredients.push({ ingredient, quantity });
            }
          }
          
          if (ingredients.length > 0) {
            return ingredients;
          }
        }
      }
      
      // If we reach here, we couldn't get a recipe from API or sample
      // Create a generic fallback recipe
      logger.warn(`No recipe found for ${dishName}, using fallback recipe`);
      
      // Try to make an educated guess based on the dish name
      if (normalizedDishName.includes('paneer')) {
        return [
          { ingredient: "Paneer", quantity: "250g" },
          { ingredient: "Onion", quantity: "1 medium" },
          { ingredient: "Tomato", quantity: "2 medium" },
          { ingredient: "Ginger", quantity: "1 inch piece" },
          { ingredient: "Garlic", quantity: "3-4 cloves" },
          { ingredient: "Green Chilli", quantity: "2" },
          { ingredient: "Spices", quantity: "2 tsp" }
        ];
      } else if (normalizedDishName.includes('chicken')) {
        return [
          { ingredient: "Chicken", quantity: "500g" },
          { ingredient: "Onion", quantity: "2 medium" },
          { ingredient: "Tomato", quantity: "2 medium" },
          { ingredient: "Ginger", quantity: "1 inch piece" },
          { ingredient: "Garlic", quantity: "5-6 cloves" },
          { ingredient: "Spices", quantity: "2 tbsp" }
        ];
      } else if (normalizedDishName.includes('dal')) {
        return [
          { ingredient: "Lentils", quantity: "1 cup" },
          { ingredient: "Onion", quantity: "1 medium" },
          { ingredient: "Tomato", quantity: "1 medium" },
          { ingredient: "Spices", quantity: "1 tbsp" }
        ];
      }
      
      // Very generic fallback
      return [
        { ingredient: "Main Ingredient", quantity: "250g" },
        { ingredient: "Onion", quantity: "1 medium" },
        { ingredient: "Tomato", quantity: "2 medium" },
        { ingredient: "Spices", quantity: "2 tsp" }
      ];
      
    } catch (error) {
      logger.error(`Error fetching recipe: ${error.message}`);
      
      // Return a very basic fallback recipe in case of error
      return [
        { ingredient: "Main Ingredient", quantity: "250g" },
        { ingredient: "Onion", quantity: "1 medium" },
        { ingredient: "Tomato", quantity: "2 medium" },
        { ingredient: "Spices", quantity: "2 tsp" }
      ];
    }
  }
}

module.exports = RecipeFetcher;