import axiosClient from "./axiosClient";

const materialApi = {
  // Get all materials: GET /game-data/materials
  getAllMaterials: () => {
    return axiosClient.get("/game-data/materials");
  },

  // Get material by materialId: GET /game-data/materials/:materialId
  getMaterialById: (materialId) => {
    return axiosClient.get(`/game-data/materials/${materialId}`);
  },

  // Create material: POST /game-data/materials (multipart/form-data)
  createMaterial: (formData) => {
    return axiosClient.post("/game-data/materials", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Update material: PUT /game-data/materials/:materialId (multipart/form-data)
  updateMaterial: (materialId, formData) => {
    return axiosClient.put(`/game-data/materials/${materialId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Delete material: DELETE /game-data/materials/:materialId
  deleteMaterial: (materialId) => {
    return axiosClient.delete(`/game-data/materials/${materialId}`);
  },
};

export default materialApi;
