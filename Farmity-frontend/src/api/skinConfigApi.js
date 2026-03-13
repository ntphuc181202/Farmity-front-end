import axiosClient from "./axiosClient";

const skinConfigApi = {
  // Get all skin configs: GET /game-data/skin-configs
  getAllSkinConfigs: (layer) => {
    const params = layer ? { layer } : {};
    return axiosClient.get("/game-data/skin-configs", { params });
  },

  // Create skin config: POST /game-data/skin-configs (multipart/form-data)
  createSkinConfig: (formData) => {
    return axiosClient.post("/game-data/skin-configs", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Update skin config: PUT /game-data/skin-configs/:configId (multipart/form-data)
  updateSkinConfig: (configId, formData) => {
    return axiosClient.put(`/game-data/skin-configs/${configId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Delete skin config: DELETE /game-data/skin-configs/:configId
  deleteSkinConfig: (configId) => {
    return axiosClient.delete(`/game-data/skin-configs/${configId}`);
  },
};

export default skinConfigApi;
