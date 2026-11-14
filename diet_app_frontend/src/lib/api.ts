import axios from 'axios';

// 1. API のベース設定（インスタンスの作成）
const api = axios.create({
    // Vercelに設定した VITE_API_URL を読み込み、なければローカルを向く
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// (インターセプターの記述はそのまま)
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;