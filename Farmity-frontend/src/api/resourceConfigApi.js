import axiosClient from "./axiosClient";

const resourceConfigApi = {
  // Get resource catalog: GET /game-data/resource-configs/catalog
  getCatalog: () => {
    return axiosClient.get("/game-data/resource-configs/catalog");
  },

  // Create resource config: POST /game-data/resource-configs (multipart/form-data)
  // Payload fields include resourceType and spawnWeight per ENDPOINTS.md.
  createResourceConfig: (formData) => {
    return axiosClient.post("/game-data/resource-configs", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Update resource config: PUT /game-data/resource-configs/:resourceId (multipart/form-data)
  // Payload fields include resourceType and spawnWeight per ENDPOINTS.md.
  updateResourceConfig: (resourceId, formData) => {
    return axiosClient.put(`/game-data/resource-configs/${resourceId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Delete resource config: DELETE /game-data/resource-configs/:resourceId
  deleteResourceConfig: (resourceId) => {
    return axiosClient.delete(`/game-data/resource-configs/${resourceId}`);
  },
};

export default resourceConfigApi;
