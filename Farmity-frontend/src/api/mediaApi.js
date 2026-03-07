import axiosClient from "./axiosClient";

const mediaApi = {
  // Upload signature: POST /media/upload-signature
  uploadSignature: (data) => {
    return axiosClient.post("/media/upload-signature", data);
  },

  // Create: POST /media/create
  createMedia: (data) => {
    return axiosClient.post("/media/create", data);
  },

  // Get all: GET /media/all
  getAllMedia: () => {
    return axiosClient.get("/media/all");
  },

  // Get by id: GET /media/:id
  getMediaById: (id) => {
    return axiosClient.get(`/media/${id}`);
  },

  // Update: POST /media/update/:id
  updateMedia: (id, data) => {
    return axiosClient.post(`/media/update/${id}`, data);
  },

  // Delete: DELETE /media/delete/:id
  deleteMedia: (id) => {
    return axiosClient.delete(`/media/delete/${id}`);
  },
};

export default mediaApi;