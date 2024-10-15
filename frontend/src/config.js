import axios from "axios";

// Ensure to use the computer's IP address
export const baseURL = "http://192.168.1.191:5000"; // Replace with your Flask server's IP and port

const axiosInstance = axios.create({
  baseURL,
});

export default axiosInstance;
