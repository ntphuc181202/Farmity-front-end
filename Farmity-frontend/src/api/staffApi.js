import axiosClient from "./axiosClient";

const staffApi = {
  createStaffAccount: (payload) => {
    return axiosClient.post("/auth/register-admin", payload);
  },

  getStaffAccounts: () => {
    return axiosClient.get("/auth/staff-accounts");
  },

  findStaffAccount: (accountId) => {
    return axiosClient.get(`/auth/staff/${accountId}`);
  },

  updateStaffAccount: (accountId, update) => {
    return axiosClient.put(`/auth/staff/${accountId}`, update);
  },

  deleteStaffAccount: (accountId) => {
    return axiosClient.delete(`/auth/staff/${accountId}`);
  },
};

export default staffApi;
