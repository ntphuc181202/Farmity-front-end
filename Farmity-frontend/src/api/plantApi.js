import axiosClient from "./axiosClient";

const plantApi = {
  // Get all plants: GET /game-data/plants/all
  getAllPlants: () => {
    return axiosClient.get("/game-data/plants/all");
  },

  // Get plant by game-side plantId: GET /game-data/plants/by-plant-id/:plantId
  getPlantByPlantId: (plantId) => {
    return axiosClient.get(`/game-data/plants/by-plant-id/${plantId}`);
  },

  // Create plant: POST /game-data/plants/create (multipart/form-data)
  createPlant: (formData) => {
    return axiosClient.post("/game-data/plants/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Update plant: PUT /game-data/plants/:plantId (multipart/form-data)
  updatePlant: (plantId, formData) => {
    return axiosClient.put(`/game-data/plants/${plantId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Delete plant: DELETE /game-data/plants/:plantId
  deletePlant: (plantId) => {
    return axiosClient.delete(`/game-data/plants/${plantId}`);
  },
};

export default plantApi;
