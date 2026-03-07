import axiosClient from "./axiosClient";

const authApi = {
  // Đăng ký admin mới: POST /auth/register-admin
  registerAdmin: (payload) => {
    // payload: { username, password, email, adminSecret }
    return axiosClient.post("/auth/register-admin", payload);
  },

  // Đăng nhập admin: POST /auth/login-admin
  loginAdmin: (payload) => {
    // payload: { username, password }
    return axiosClient.post("/auth/login-admin", payload);
  },

  // Kiểm tra phiên admin hiện tại: GET /auth/admin-check
  adminCheck: () => {
    return axiosClient.get("/auth/admin-check");
  },

  // Đăng xuất admin: POST /auth/logout
  logout: () => {
    return axiosClient.post("/auth/logout");
  },

  // request OTP
  requestResetPassword: (email) => {
    return axiosClient.post("/auth/admin-reset/request", { email });
  },

  // confirm OTP + new password
  confirmResetPassword: (payload) => {
    return axiosClient.post("/auth/admin-reset/confirm", payload);
  },
};

export default authApi;
