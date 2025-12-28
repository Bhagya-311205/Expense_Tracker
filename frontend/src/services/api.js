import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true, // Automatically send cookies with requests
});

// localStorage method (commented out - using httpOnly cookies instead)
// const api_localStorage = axios.create({
//   baseURL: "http://localhost:3000/api",
//   withCredentials: true,
// });

// api_localStorage.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

export const authAPI = {
  signup: async (name, email, password) => {
    const { data } = await api.post("/auth/signup", { name, email, password });
    return data;
  },

  verifyOTP: async (email, otp) => {
    const { data } = await api.post("/auth/verify-otp", { email, otp });
    // Token stored in httpOnly cookie by server - no need to store in localStorage
    // localStorage.setItem("token", data.token); // Commented out - using cookies
    return data;
  },

  resendOTP: async (email) => {
    const { data } = await api.post("/auth/resend-otp", { email });
    return data;
  },

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },

  logout: async () => {
    const { data } = await api.post("/auth/logout");
    // Token cleared from httpOnly cookie by server - no need to remove from localStorage
    // localStorage.removeItem("token"); // Commented out - using cookies
    return data;
  },

  getCurrentUser: async () => {
    const { data } = await api.get("/auth/current-user");
    return data;
  },
};

export const transactionAPI = {
  getAll: async () => {
    const { data } = await api.get("/transactions/all");
    return data;
  },

  getSummary: async () => {
    const { data } = await api.get("/transactions/summary");
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/transactions/${id}`);
    return data;
  },

  create: async (transactionData) => {
    const { data } = await api.post("/transactions/create", transactionData);
    return data;
  },

  update: async (id, transactionData) => {
    const { data } = await api.put(
      `/transactions/update/${id}`,
      transactionData
    );
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/transactions/delete/${id}`);
    return data;
  },
};

export default api;
