import axiosClient from "./axiosClient";

const achievementApi = {
  // Create achievement definition: POST /game-data/achievements/create
  createAchievement: (data) => {
    return axiosClient.post("/game-data/achievements/create", data);
  },

  // Get all definitions: GET /game-data/achievements/all
  getAllAchievements: () => {
    return axiosClient.get("/game-data/achievements/all");
  },

  // Get one definition: GET /game-data/achievements/:achievementId
  getAchievementById: (achievementId) => {
    return axiosClient.get(`/game-data/achievements/${achievementId}`);
  },

  // Update one definition: PUT /game-data/achievements/:achievementId
  updateAchievement: (achievementId, data) => {
    return axiosClient.put(`/game-data/achievements/${achievementId}`, data);
  },

  // Delete one definition: DELETE /game-data/achievements/:achievementId
  deleteAchievement: (achievementId) => {
    return axiosClient.delete(`/game-data/achievements/${achievementId}`);
  },
};

export default achievementApi;
