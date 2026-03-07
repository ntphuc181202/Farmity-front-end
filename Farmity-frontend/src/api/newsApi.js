import axiosClient from "./axiosClient";

const newsApi = {
  // Upload signature: POST /news/upload-signature
  uploadSignature: (data) => {
    return axiosClient.post("/news/upload-signature", data);
  },

  // Create: POST /news/create
  createNews: (data) => {
    return axiosClient.post("/news/create", data);
  },

  // Get all: GET /news/all
  getAllNews: () => {
    return axiosClient.get("/news/all");
  },

  // Get by id: GET /news/:id
  getNewsById: (id) => {
    return axiosClient.get(`/news/${id}`);
  },

  // Update: POST /news/update/:id
  updateNews: (id, data) => {
    return axiosClient.post(`/news/update/${id}`, data);
  },

  // Delete: DELETE /news/delete/:id
  deleteNews: (id) => {
    return axiosClient.delete(`/news/delete/${id}`);
  },
};

export default newsApi;