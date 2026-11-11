import { useState, useEffect } from 'react';
import api from '../../lib/api';
import WeightChart from '../../components/WeightChart';

interface DailyRecord {
    id?: number;
    recorded_at: string;
    weight: number;
    fat_percentage?: number;
    memo?: string;
}

interface DashboardData {
    latest_weight?: number;
    target_weight?: number;
    difference_to_goal?: number;
    height?: number;
    age?: number;
    gender?: string;
    activity_level?: string;
}

export default function Dashboard() {
    const today = new Date().toISOString().split('T')[0];

    const [date, setDate] = useState<string>(today);
    const [weight, setWeight] = useState<string>('');
    const [fatPercentage, setFatPercentage] = useState<string>('');
    const [memo, setMemo] = useState<string>('');
    const [records, setRecords] = useState<DailyRecord[]>([]);
    
    // 🟢 ダッシュボードの集計データを格納する state を追加
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    // 🟢 ダッシュボード専用のデータを取得する関数を追加
    const fetchDashboardData = async () => {
        try {
            const res = await api.get('/dashboard');
            setDashboardData(res.data);
        } catch (err) {
            console.error('ダッシュボードデータの取得に失敗しました', err);
        }
    };

    // 過去の記録一覧を取得する関数
    const fetchRecords = async () => {
        try {
            const res = await api.get('/weight_logs');
            setRecords(res.data);
        } catch (err) {
            console.error('記録の取得に失敗しました', err);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        fetchRecords();
    }, []);

    // 体重記録の送信処理
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        try {
            await api.post('/weight_logs', {
                weight_log: {
                    recorded_at: date,
                    weight: parseFloat(weight),
                    memo: memo
                }
            });
            setMessage('記録を保存しました！');
            setWeight('');
            setFatPercentage('');
            setMemo('');
            fetchRecords();
            fetchDashboardData(); // 🟢 保存後にダッシュボードの数値も再取得して更新
        } catch (err) {
            setMessage('保存に失敗しました。');
        }
    };

    // 削除ボタンが押された時の処理
    const handleDelete = async (id: number) => {
        if (!window.confirm('本当にこの記録を削除しますか？')) return;

        try {
            await api.delete(`/weight_logs/${id}`);
            setRecords(records.filter((record) => record.id !== id));
            fetchDashboardData(); // 🟢 削除後も数値を再計算して更新
        } catch (error) {
            console.error('削除に失敗しました:', error);
            alert('削除に失敗しました');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>ダッシュボード</h2>

            {/* 🟢 バックエンドから受け取ったサマリー情報を表示するエリア */}
            {dashboardData && (
                <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h3>現在の状況</h3>
                    <p>最新体重: <strong>{dashboardData.latest_weight ?? '未記録'} kg</strong></p>
                    <p>目標体重: <strong>{dashboardData.target_weight ?? '未設定'} kg</strong></p>
                    <p>目標との差: <strong>{dashboardData.difference_to_goal ?? '--'} kg</strong></p>
                    <p>身長: {dashboardData.height ?? '--'} cm / 年齢: {dashboardData.age ?? '--'} 歳</p>
                </div>
            )}

            <h2>今日の体重を記録</h2>
            {message && <p style={{ color: 'green' }}>{message}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                    <label>日付: </label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div>
                    <label>体重 (kg): </label>
                    <input type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} required />
                </div>
                <div>
                    <label>体脂肪率 (%): </label>
                    <input type="number" step="0.01" value={fatPercentage} onChange={(e) => setFatPercentage(e.target.value)} />
                </div>
                <div>
                    <label>メモ: </label>
                    <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="運動内容やひとこと" />
                </div>
                <button type="submit">保存する</button>
            </form>

            <hr style={{ margin: '30px 0' }} />

            <h2>体重推移グラフ</h2>
            <WeightChart records={records} />

            <hr style={{ margin: '30px 0' }} />

            <h2>これまでの記録</h2>
            <ul>
                {records.map((r) => (
                    <li key={r.id || r.recorded_at} style={{ marginBottom: '8px' }}>
                        <strong>{r.recorded_at}</strong>: {r.weight} kg
                        {r.fat_percentage && ` (${r.fat_percentage}%)`}
                        {r.memo && ` - ${r.memo}`}
                        <button
                            onClick={() => handleDelete(r.id!)}
                            style={{ marginLeft: '10px', color: 'red', cursor: 'pointer' }}
                        >
                            削除
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}