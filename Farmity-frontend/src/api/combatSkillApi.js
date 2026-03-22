import axiosClient from "./axiosClient";

const combatSkillApi = {
  // Public read endpoints
  getCatalog: () => axiosClient.get("/game-data/combat-skills/catalog"),
  getAllCombatSkills: () => axiosClient.get("/game-data/combat-skills/all"),
  getCombatSkillById: (skillId) => axiosClient.get(`/game-data/combat-skills/by-skill-id/${skillId}`),

  // Admin write endpoints
  createCombatSkill: (formData) =>
    axiosClient.post("/game-data/combat-skills/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateCombatSkill: (skillId, formData) =>
    axiosClient.put(`/game-data/combat-skills/${skillId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteCombatSkill: (skillId) => axiosClient.delete(`/game-data/combat-skills/${skillId}`),
};

export default combatSkillApi;
