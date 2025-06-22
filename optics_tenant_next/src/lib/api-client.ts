import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
  withCredentials: true
});




API.interceptors.response.use(
  res => res,
  async err => {
    if (err.response.status === 401) {
      await API.post("/api/users/token/refresh/");
      return API(err.config);
    }
    return Promise.reject(err);
  }
);


export default API;