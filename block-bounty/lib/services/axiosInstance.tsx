// axiosInstance.ts
import axios, { AxiosInstance } from 'axios';
const environment=process.env.ENVIRONMENT;
const axiosInstance: AxiosInstance = axios.create({
  baseURL: environment=="PROD"?"https://block-bounty.vercel.app/api":'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
