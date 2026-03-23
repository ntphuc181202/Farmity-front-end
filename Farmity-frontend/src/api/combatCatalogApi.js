import axiosClient from "./axiosClient";

const combatCatalogApi = {
  // Get combat catalogs: GET /game-data/combat-catalogs?type=skill_vfx
  getAllCombatCatalogs: (type) => {
    const params = type ? { type } : {};
    return axiosClient.get("/game-data/combat-catalogs", { params });
  },

  // Create combat catalog: POST /game-data/combat-catalogs (application/json)
  createCombatCatalog: (payload) => {
    return axiosClient.post("/game-data/combat-catalogs", payload);
  },

  // Update combat catalog: PUT /game-data/combat-catalogs/:configId (application/json)
  updateCombatCatalog: (configId, payload) => {
    return axiosClient.put(`/game-data/combat-catalogs/${configId}`, payload);
  },

  // Delete combat catalog: DELETE /game-data/combat-catalogs/:configId
  deleteCombatCatalog: (configId) => {
    return axiosClient.delete(`/game-data/combat-catalogs/${configId}`);
  },
};

export default combatCatalogApi;
