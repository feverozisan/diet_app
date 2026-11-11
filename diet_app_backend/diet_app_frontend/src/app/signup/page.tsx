import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';

export default function SignupPage() {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        try {
            // Rails側のユーザー作成用エンドポイント（例: /users または /signup）に合わせて調整してください
            await api.post('/users', { user: { username, password } });

            // 登録成功したらそのままログイン画面へ誘導
            alert('アカウントが作成されました！ログインしてください。');
            navigate('/login');
        } catch (err) {
            setError('登録に失敗しました。別のユーザー名をお試しください。');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>新規アカウント登録</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSignup}>
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
                <button type="submit">登録する</button>
            </form>

            <div style={{ marginTop: '15px' }}>
                <p>すでにアカウントをお持ちですか？ <Link to="/login">ログインはこちら</Link></p>
            </div>
        </div>
    );
}