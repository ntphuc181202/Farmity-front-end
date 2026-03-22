import axiosClient from "./axiosClient";

const combatCatalogApi = {
  // Get combat catalogs: GET /game-data/combat-catalogs?type=weapon
  getAllCombatCatalogs: (type) => {
    const params = type ? { type } : {};
    return axiosClient.get("/game-data/combat-catalogs", { params });
  },

  // Create combat catalog: POST /game-data/combat-catalogs (multipart/form-data)
  createCombatCatalog: (formData) => {
    return axiosClient.post("/game-data/combat-catalogs", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Update combat catalog: PUT /game-data/combat-catalogs/:configId (multipart/form-data)
  updateCombatCatalog: (configId, formData) => {
    return axiosClient.put(`/game-data/combat-catalogs/${configId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Delete combat catalog: DELETE /game-data/combat-catalogs/:configId
  deleteCombatCatalog: (configId) => {
    return axiosClient.delete(`/game-data/combat-catalogs/${configId}`);
  },
};

export default combatCatalogApi;
