// src/api.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
    baseURL: BASE_URL,
});

const refreshAccessToken = async (refreshToken) => {
    try {
        const response = await axios.post(`${BASE_URL}auth/token/refresh/`, {
            refresh: refreshToken,
        });

        return response.data;
    } catch (error) {
        console.log("Token refresh failed:", error);
        throw error;
    }
};

api.interceptors.request.use(
    async (config) => {
        const storedData = localStorage.getItem("user_data");
        if (!storedData) return config;

        const userData = JSON.parse(storedData);
        let accessToken = userData.access;
        const refreshToken = userData.refresh;

        if (accessToken) {
            const decoded = jwtDecode(accessToken);
            const now = Date.now() / 1000;

            if (decoded.exp < now) {
                try {
                    const refreshed = await refreshAccessToken(refreshToken);

                    accessToken = refreshed.access;

                    const updatedUser = {
                        ...userData,
                        access: refreshed.access,
                        refresh: refreshed.refresh || userData.refresh,
                    };
                    localStorage.setItem(
                        "user_data",
                        JSON.stringify(updatedUser),
                    );
                } catch (error) {
                    console.log(error);
                    localStorage.removeItem("user_data");
                    window.location.href = "/login";
                    return Promise.reject(error);
                }
            }

            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error),
);

export default api;
