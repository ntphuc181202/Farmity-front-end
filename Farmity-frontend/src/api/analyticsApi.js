import axiosClient from "./axiosClient";

const analyticsApi = {
  getSummary: (params = {}) => {
    return axiosClient.get("/admin/analytics/summary", { params });
  },
};

export default analyticsApi;
