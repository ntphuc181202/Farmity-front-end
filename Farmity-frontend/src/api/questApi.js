import axiosClient from "./axiosClient";

const questApi = {
  // POST /game-data/quests
  createQuest: (data) => {
    return axiosClient.post("/game-data/quests", data);
  },

  // PUT /game-data/quests/:questId
  updateQuest: (questId, data) => {
    return axiosClient.put(`/game-data/quests/${questId}`, data);
  },

  // GET /game-data/quests/catalog
  getQuestCatalog: () => {
    return axiosClient.get("/game-data/quests/catalog");
  },

  // GET /game-data/quests/all
  getAllQuests: () => {
    return axiosClient.get("/game-data/quests/all");
  },

  // GET /game-data/quests/:id
  getQuestById: (id) => {
    return axiosClient.get(`/game-data/quests/${id}`);
  },

  // GET /game-data/quests/by-quest-id/:questId
  getQuestByQuestId: (questId) => {
    return axiosClient.get(`/game-data/quests/by-quest-id/${questId}`);
  },

  // DELETE /game-data/quests/:questId
  deleteQuest: (questId) => {
    return axiosClient.delete(`/game-data/quests/${questId}`);
  },
};

export default questApi;
