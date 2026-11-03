import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Link を追加
import api from '../../lib/api';

export default function LoginPage() {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await api.post('/login', { username, password });
            const token = response.data.token;
            localStorage.setItem('token', token);
            navigate('/dashboard');
        } catch (err) {
            setError('ユーザー名またはパスワードが正しくありません。');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>ログイン</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>ユーザー名：</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>パスワード：</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">ログイン</button>
            </form>

            {/* 👇 ここから新規登録へのリンクを追加 */}
            <div style={{ marginTop: '15px' }}>
                <p>アカウントをお持ちでないですか？ <Link to="/signup">新規登録はこちら</Link></p>
            </div>
        </div>
    );
}