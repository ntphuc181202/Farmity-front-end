import axiosClient from "./axiosClient";

const blogApi = {
  // Create: POST /blog/create
  createBlog: (data) => {
    return axiosClient.post("/blog/create", data);
  },

  // Get all: GET /blog/all
  getAllBlogs: () => {
    return axiosClient.get("/blog/all");
  },

  // Get by id: GET /blog/:id
  getBlogById: (id) => {
    return axiosClient.get(`/blog/${id}`);
  },

  // Update: POST /blog/update/:id
  updateBlog: (id, data) => {
    return axiosClient.post(`/blog/update/${id}`, data);
  },

  // Delete: DELETE /blog/delete/:id
  deleteBlog: (id) => {
    return axiosClient.delete(`/blog/delete/${id}`);
  },
};

export default blogApi;
