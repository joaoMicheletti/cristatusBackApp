// src/http/axios.instance.ts
import axios, { AxiosInstance } from 'axios';

export function createHttpClient(baseURL: string): AxiosInstance {
  return axios.create({
    baseURL: 'https://graph.facebook.com/v22.0/' ,
    timeout: 10_000,               // 10s de timeout
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      // se precisar de token padrão:
      // Authorization: `Bearer ${process.env.API_TOKEN}`,
    },
  });
}
