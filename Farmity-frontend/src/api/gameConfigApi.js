import axiosClient from "./axiosClient";

const gameConfigApi = {
  // Get main-menu background config: GET /game-config/main-menu
  getMainMenu: () => {
    return axiosClient.get("/game-config/main-menu");
  },

  // Update main-menu background: PUT /game-config/main-menu (multipart/form-data)
  updateMainMenu: (formData) => {
    return axiosClient.put("/game-config/main-menu", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default gameConfigApi;
