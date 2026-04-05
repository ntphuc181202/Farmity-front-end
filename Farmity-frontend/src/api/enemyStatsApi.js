import axiosClient from "./axiosClient";

const enemyStatsApi = {
  getCatalog: () => axiosClient.get("/game-data/enemy-stats/catalog"),
  updateEnemyStats: (enemyId, payload) =>
    axiosClient.put(`/game-data/enemy-stats/${enemyId}`, payload),
};

export default enemyStatsApi;
