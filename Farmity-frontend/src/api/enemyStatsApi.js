import axiosClient from "./axiosClient";

const enemyStatsApi = {
  // GET /game-data/enemy-stats/all
  getAllEnemyStats: () => {
    return axiosClient.get("/game-data/enemy-stats/all");
  },

  // GET /game-data/enemy-stats/:enemyId
  getEnemyStatByEnemyId: (enemyId) => {
    return axiosClient.get(`/game-data/enemy-stats/${enemyId}`);
  },

  // GET /game-data/enemy-stats/catalog
  getEnemyStatsCatalog: () => {
    return axiosClient.get("/game-data/enemy-stats/catalog");
  },

  // PUT /game-data/enemy-stats/:enemyId
  updateEnemyStat: (enemyId, payload) => {
    return axiosClient.put(`/game-data/enemy-stats/${enemyId}`, payload, {
      headers: { "Content-Type": "application/json" },
    });
  },
};

export default enemyStatsApi;
