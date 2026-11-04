import axios from 'axios';

// 1. API のベース設定（インスタンスの作成）
const api = axios.create({
    // 👇 '/api' に変更して、Vercelのプロキシ経由でAWSに通信するようにします！
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

    // 2. リクエスト・インターセプター（送信直前に自動で実行される処理）
    api.interceptors.request.use(
    (config) => {
        // ブラウザの localStorage から保存されたトークンを取得
        if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            // トークンが存在すれば Authorization ヘッダーにセット
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