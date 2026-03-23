import axiosClient from "./axiosClient";

const itemApi = {
  // Get full item catalog: GET /game-data/items/catalog
  getAllItems: () => {
    return axiosClient.get("/game-data/items/catalog").then((res) => {
      const data = res?.data;
      const items = Array.isArray(data)
        ? data
        : data?.items || data?.catalog || data?.data || [];
      return { ...res, data: items };
    });
  },

  // Get item by game-side itemID: GET /game-data/items/by-item-id/:itemID
  getItemByItemId: (itemID) => {
    return axiosClient.get(`/game-data/items/by-item-id/${itemID}`);
  },

  // Create item: POST /game-data/items/create (multipart/form-data)
  createItem: (formData) => {
    return axiosClient.post("/game-data/items/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Update item: PUT /game-data/items/:itemID (multipart/form-data)
  updateItem: (itemID, formData) => {
    return axiosClient.put(`/game-data/items/${itemID}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Delete item: DELETE /game-data/items/:itemID
  deleteItem: (itemID) => {
    return axiosClient.delete(`/game-data/items/${itemID}`);
  },
};

export default itemApi;
