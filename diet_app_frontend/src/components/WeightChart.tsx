'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface DailyRecord {
    id?: number;
    recorded_at: string; // 🟢 date から recorded_at に修正
    weight: number;
    fat_percentage?: number;
    memo?: string;
}

interface WeightChartProps {
    records: DailyRecord[];
}

export default function WeightChart({ records }: WeightChartProps) {
  // 日付の古い順（昇順）に並べ替えてグラフ表示用データを作成
    const chartData = [...records].reverse().map((r) => ({
        // 🟢 r.date ではなく r.recorded_at を参照するように修正
        date: r.recorded_at ? r.recorded_at.slice(5) : '', // "2026-09-21" -> "09-21"
        weight: Number(r.weight),
    }));

    if (records.length === 0) {
        return <p style={{ textAlign: 'center', color: '#888' }}>データがまだありません。</p>;
    }

    return (
        <div style={{ width: '100%', height: 300, marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="weight"
                        name="体重 (kg)"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}