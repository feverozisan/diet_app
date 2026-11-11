import { useState, useEffect } from 'react';
import api from '../../lib/api';
import WeightChart from '../../components/WeightChart';

interface DailyRecord {
    id?: number;
    recorded_at: string; // 🟢 date から recorded_at に修正
    weight: number;
    fat_percentage?: number;
    memo?: string;
}

export default function Dashboard() {
    // 今日の日付を YYYY-MM-DD 形式で取得
    const today = new Date().toISOString().split('T')[0];

    const [date, setDate] = useState<string>(today);
    const [weight, setWeight] = useState<string>('');
    const [fatPercentage, setFatPercentage] = useState<string>('');
    const [memo, setMemo] = useState<string>('');
    const [records, setRecords] = useState<DailyRecord[]>([]);
    const [message, setMessage] = useState<string | null>(null);

    // 過去の記録一覧を取得する関数
    const fetchRecords = async () => {
        try {
            // 🟢 Rails のルーティングに合わせて /weight_logs に変更
            const res = await api.get('/weight_logs');
            setRecords(res.data);
        } catch (err) {
            console.error('記録の取得に失敗しました', err);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    // 体重記録の送信処理
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        try {
            // 🟢 URL を /weight_logs に、送信キーを weight_log と recorded_at に変更
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
            fetchRecords(); // 一覧を再取得
        } catch (err) {
            setMessage('保存に失敗しました。');
        }
    };

    // 削除ボタンが押された時の処理
    const handleDelete = async (id: number) => {
    // 誤操作防止の確認ダイアログ
    if (!window.confirm('本当にこの記録を削除しますか？')) return;

    try {
        // 1. Rails API へ DELETE リクエストを送る (例: /weight_logs/5)
        await api.delete(`/weight_logs/${id}`);

        // 2. 成功したら、State（records）から削除した ID のデータを取り除いて画面を更新
        setRecords(records.filter((record) => record.id !== id));
    } catch (error) {
        console.error('削除に失敗しました:', error);
        alert('削除に失敗しました');
    }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
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

            {/* 📊 ここに WeightChart を追加 */}
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

                            {/* 🟢 ここに削除ボタンを追加 */}
                            <button
                                onClick={() => handleDelete(r.id)}
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