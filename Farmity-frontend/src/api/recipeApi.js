import axiosClient from "./axiosClient";

const recipeApi = {
  // Get all recipes: GET /game-data/crafting-recipes/all
  getAllRecipes: () => {
    return axiosClient.get("/game-data/crafting-recipes/all");
  },

  // Get recipe by game-side recipeID: GET /game-data/crafting-recipes/by-recipe-id/:recipeID
  getRecipeByRecipeId: (recipeID) => {
    return axiosClient.get(`/game-data/crafting-recipes/by-recipe-id/${recipeID}`);
  },

  // Create recipe: POST /game-data/crafting-recipes/create
  createRecipe: (data) => {
    return axiosClient.post("/game-data/crafting-recipes/create", data);
  },

  // Update recipe: PUT /game-data/crafting-recipes/:recipeID
  updateRecipe: (recipeID, data) => {
    return axiosClient.put(`/game-data/crafting-recipes/${recipeID}`, data);
  },

  // Delete recipe: DELETE /game-data/crafting-recipes/:recipeID
  deleteRecipe: (recipeID) => {
    return axiosClient.delete(`/game-data/crafting-recipes/${recipeID}`);
  },
};

export default recipeApi;
