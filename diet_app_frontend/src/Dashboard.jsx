import React, { useState, useEffect } from 'react';
import api from './lib/api'; // 設定済みの axios インスタンス
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine
} from 'recharts';

export default function Dashboard() {
    // 🎯 目標用のステート
    const [goal, setGoal] = useState(null);
    const [targetWeight, setTargetWeight] = useState('');
    const [memo, setMemo] = useState('');
    const [message, setMessage] = useState('');

    // ⚖️ 体重記録用のステート
    const [weight, setWeight] = useState('');
    const [recordedAt, setRecordedAt] = useState(new Date().toISOString().split('T')[0]);
    const [weightMemo, setWeightMemo] = useState('');
    const [weightLogs, setWeightLogs] = useState([]);
    const [logMessage, setLogMessage] = useState('');
    const [editingWeightId, setEditingWeightId] = useState(null);


    // 📈 表示モード
    const [viewMode, setViewMode] = useState('daily');

    // ユーザー設定
    const [height, setHeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('male');
    const [activityLevel, setActivityLevel] = useState('low');

    // --- 食事管理用の State ---
    const [mealLogs, setMealLogs] = useState([]);
    const [mealForm, setMealForm] = useState({
        meal_type: 'breakfast',
        name: '',
        calories: '',
        protein: '',
        fat: '',
        carbs: '',
        recorded_at: new Date().toISOString().split('T')[0],
    });
    const [editingMealId, setEditingMealId] = useState(null);

    const [calorieDeficit, setCalorieDeficit] = useState(500);

    const convertToMonthlyData = (logs) => {
        const monthlyGroups = {};
        logs.forEach((log) => {
            const monthKey = log.recorded_at.substring(0, 7);
            if (!monthlyGroups[monthKey]) {
                monthlyGroups[monthKey] = { total: 0, count: 0 };
            }
            monthlyGroups[monthKey].total += parseFloat(log.weight);
            monthlyGroups[monthKey].count += 1;
        });

        return Object.keys(monthlyGroups).map((monthKey) => ({
            recorded_at: monthKey,
            weight: (monthlyGroups[monthKey].total / monthlyGroups[monthKey].count).toFixed(2),
        }));
    };

    const convertToWeeklyData = (logs) => {
        const weeklyGroups = {};
        logs.forEach((log) => {
            const date = new Date(log.recorded_at);
            const startOfYear = new Date(date.getFullYear(), 0, 1);
            const pastDaysOfYear = (date - startOfYear) / 86400000;
            const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
            const weekKey = `${date.getFullYear()}年 第${weekNum}週`;

            if (!weeklyGroups[weekKey]) {
                weeklyGroups[weekKey] = { total: 0, count: 0 };
            }
            weeklyGroups[weekKey].total += parseFloat(log.weight);
            weeklyGroups[weekKey].count += 1;
        });

        return Object.keys(weeklyGroups).map((weekKey) => ({
            recorded_at: weekKey,
            weight: (weeklyGroups[weekKey].total / weeklyGroups[weekKey].count).toFixed(2),
        }));
    };

    const getChartData = () => {
        if (viewMode === 'weekly') return convertToWeeklyData(weightLogs);
        if (viewMode === 'monthly') return convertToMonthlyData(weightLogs);
        return weightLogs;
    };

    const latestWeight = weightLogs.length > 0 ? parseFloat(weightLogs[0].weight) : null;

    const calculateBMI = (w, h) => {
        if (!w || !h) return null;
        const heightInMeters = h / 100;
        return (w / (heightInMeters * heightInMeters)).toFixed(1);
    };

    const getBMILabel = (bmi) => {
        if (!bmi) return '';
        if (bmi < 18.5) return { text: '低体重', color: '#1890ff' };
        if (bmi < 25) return { text: '普通体重', color: '#52c41a' };
        return { text: '肥満', color: '#ff4d4f' };
    };

    const currentBMI = calculateBMI(latestWeight, height);
    const bmiLabel = getBMILabel(currentBMI);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/dashboard');
            if (response.data.recent_logs) {
                setWeightLogs(response.data.recent_logs);
            } else if (Array.isArray(response.data)) {
                setWeightLogs(response.data);
            }

            if (response.data.target_weight !== undefined) {
                setGoal({ target_weight: response.data.target_weight });
                setTargetWeight(response.data.target_weight);
            }
            if (response.data.height) setHeight(response.data.height);
            if (response.data.age) setAge(response.data.age);
            if (response.data.gender) setGender(response.data.gender);
            if (response.data.activity_level) setActivityLevel(response.data.activity_level);
        } catch (error) {
            console.error('データの取得に失敗:', error);
        }
    };

    const handleHeightChange = async (newHeight) => {
        setHeight(newHeight);
        if (!newHeight) return;
        try {
            await api.patch('/me', { user: { height: parseFloat(newHeight), age: Number(age) } });
        } catch (error) {
            console.error('身長の保存に失敗:', error);
        }
    };

    const handleAgeChange = async (newAge) => {
        setAge(newAge);
        if (!newAge) return;
        try {
            await api.patch('/me', { user: { age: Number(newAge) } });
        } catch (error) {
            console.error('年齢の保存に失敗:', error);
        }
    };

    const fetchMealLogs = async () => {
        try {
            const response = await api.get('/meal_logs', {
                params: { date: mealForm.recorded_at }
            });
            setMealLogs(response.data);
        } catch (error) {
            console.error('食事記録の取得に失敗:', error);
        }
    };

    const handleGenderChange = async (newGender) => {
        setGender(newGender);
        try {
            await api.patch('/me', { user: { gender: newGender } });
        } catch (error) {
            console.error('性別の保存に失敗:', error);
        }
    };

    const handleActivityLevelChange = async (newLevel) => {
        setActivityLevel(newLevel);
        try {
            await api.patch('/me', { user: { activity_level: newLevel } });
        } catch (error) {
            console.error('活動量の保存に失敗:', error);
        }
    };

    const calculateBMR = (w, h, a, g) => {
        if (!w || !h || !a || !g) return null;
        const base = 10 * w + 6.25 * h - 5 * a;
        return Math.round(g === 'male' ? base + 5 : base - 161);
    };

    const calculateTDEE = (bmr, level) => {
        if (!bmr) return null;
        const factors = { low: 1.2, moderate: 1.55, high: 1.725 };
        return Math.round(bmr * (factors[level] || 1.2));
    };

    const calculatePFC = (tdee) => {
        if (!tdee) return null;
        return {
            protein: Math.round((tdee * 0.20) / 4),
            fat: Math.round((tdee * 0.20) / 9),
            carb: Math.round((tdee * 0.60) / 4),
        };
    };

    const handleMealSubmit = async (e) => {
        e.preventDefault();
        if (!mealForm.name) return alert('料理名を入力してください');

        const formattedData = {
            ...mealForm,
            calories: mealForm.calories ? parseInt(mealForm.calories, 10) : 0,
            protein: mealForm.protein ? parseFloat(mealForm.protein) : 0,
            fat: mealForm.fat ? parseFloat(mealForm.fat) : 0,
            carbs: mealForm.carbs ? parseFloat(mealForm.carbs) : 0,
        };

        try {
            if (editingMealId) {
                // 編集モード：PUT リクエスト
                // Rails側のルーティング（resources :meal_logs）に合わせてパスを指定
                await api.put(`/meal_logs/${editingMealId}`, { meal_log: formattedData });
                setEditingMealId(null); // 編集モードを解除
                setMealForm({
                    meal_type: 'breakfast',
                    name: '',
                    calories: '',
                    protein: '',
                    fat: '',
                    carbs: '',
                    recorded_at: new Date().toISOString().split('T')[0],
                });
                fetchMealLogs();
            } else {
                await api.post('/meal_logs', { meal_log: formattedData });
                setMealForm((prev) => ({ ...prev, name: '', calories: '', protein: '', fat: '', carbs: '' }));
                fetchMealLogs();
            }
        } catch (error) {
            console.error('食事記録の保存に失敗:', error);
        }
    };

    const handleEditClick = (log) => {
        setEditingMealId(log.id);
        setMealForm({
            meal_type: log.meal_type,
            name: log.name,
            calories: log.calories,
            protein: log.protein,
            fat: log.fat,
            carbs: log.carbs,
            recorded_at: log.recorded_at
        });
    };

    const handleMealDelete = async (id) => {
        try {
            await api.delete(`/meal_logs/${id}`);
            fetchMealLogs();
        } catch (error) {
            console.error('食事記録の削除に失敗:', error);
        }
    };

    const currentBMR = calculateBMR(latestWeight, height, age, gender);
    const currentTDEE = calculateTDEE(currentBMR, activityLevel);
    const pfcTarget = calculatePFC(currentTDEE);

    const changeDate = (offset) => {
        const [year, month, day] = mealForm.recorded_at.split('-').map(Number);
        const current = new Date(year, month - 1, day);
        current.setDate(current.getDate() + offset);

        const y = current.getFullYear();
        const m = String(current.getMonth() + 1).padStart(2, '0');
        const d = String(current.getDate()).padStart(2, '0');
        setMealForm((prev) => ({ ...prev, recorded_at: `${y}-${m}-${d}` }));
    };

    const handleSetToday = () => {
        const today = new Date().toISOString().split('T')[0];
        setMealForm((prev) => ({ ...prev, recorded_at: today }));
    };

    const handleGoalSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = goal ? 'put' : 'post';
            const response = await api[method]('/goal', {
                goal: {
                    target_weight: parseFloat(targetWeight),
                    memo: memo,
                },
            });

            setGoal(response.data);
            setMessage('目標を保存しました！✨');
            setMemo('');
        } catch (error) {
            console.error('目標の保存に失敗:', error);
            setMessage('目標の保存に失敗しました。');
        }
    };

    const handleWeightSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingWeightId) {
                await api.put(`/weight_logs/${editingWeightId}`, {
                    weight_log: {
                        weight: parseFloat(weight),
                        recorded_at: recordedAt,
                        memo: weightMemo,
                    }
                });
                setEditingWeightId(null);
            } else {
                await api.post('/weight_logs', {
                    weight_log: {
                        weight: parseFloat(weight),
                        recorded_at: recordedAt,
                        memo: weightMemo,
                    },
                });
            }
            setLogMessage('体重を記録しました！⚖️');
            setWeight('');
            setWeightMemo('');
            setRecordedAt(new Date().toISOString().split('T')[0]);
            fetchDashboardData();
        } catch (error) {
            console.error('体重の記録に失敗:', error);
            setLogMessage('体重の記録に失敗しました。');
        }
    };

    const handleEditWeight = (log) => {
        setEditingWeightId(log.id);
        setWeight(log.weight);
        setRecordedAt(log.recorded_at);
        setWeightMemo(log.memo || '');
    };


    const handleDelete = async (id) => {
        if (!confirm('この記録を削除してもよろしいですか？')) return;
        try {
            await api.delete(`/weight_logs/${id}`);
            fetchDashboardData();
        } catch (error) {
            console.error('削除に失敗しました:', error);
            alert('削除に失敗しました。');
        }
    };

    const totalCalories = mealLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const targetCalories = currentTDEE ? currentTDEE - calorieDeficit : null;
    const remainingCalories = targetCalories ? targetCalories - totalCalories : null;
    const weeksToGoal = (latestWeight && goal?.target_weight && calorieDeficit > 0)
        ? (((latestWeight - goal.target_weight) * 7200) / calorieDeficit / 7).toFixed(1) : null;

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        fetchMealLogs();
    }, [mealForm.recorded_at]);

    // 🎨 スタイル設定（ベース＆インプット）
    const baseCardStyle = {
        padding: '18px',
        borderRadius: '16px',
        marginBottom: '20px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
        boxSizing: 'border-box'
    };

    const inputStyle = {
        padding: '9px 12px',
        borderRadius: '8px',
        border: '1px solid rgba(0, 0, 0, 0.15)',
        fontSize: '14px',
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff'
    };

    const headingStyle = {
        margin: '0 0 12px 0',
        fontSize: '16px',
        fontWeight: 'bold'
    };

    // ログアウト
    const handleLogout = async () => {
        if (!confirm('ログアウトしますか？')) return;
// 1. localStorage からトークンを削除
    localStorage.removeItem('token');

    // 2. ログイン画面等にリダイレクト
    window.location.href = '/login';
    };

    return (
        <div style={{ padding: '15px', maxWidth: '500px', margin: '0 auto', boxSizing: 'border-box', backgroundColor: '#f4f7f9', minHeight: '100vh' }}>

            {/* 🎯 現在の目標表示 (ミントグリーン系) */}
            <div style={{ ...baseCardStyle, background: 'linear-gradient(135deg, #e6f7ff 0%, #f6ffed 100%)', border: '1px solid #b7eb8f' }}>
                <h3 style={{ ...headingStyle, color: '#237804' }}>🎯 現在の目標</h3>
                {goal ? (
                    <div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#135200', margin: '0 0 4px 0' }}>
                            {goal.target_weight} <span style={{ fontSize: '0.9rem' }}>kg</span>
                        </p>
                        {goal.memo && <p style={{ margin: 0, color: '#389e0d', fontSize: '13px' }}>メモ: {goal.memo}</p>}
                    </div>
                ) : (
                    <p style={{ margin: 0, color: '#8c8c8c', fontSize: '13px' }}>まだ目標が設定されていません。</p>
                )}
            </div>

            {/* 📊 BMI 表示カード (アクアブルー系) */}
            <div style={{ ...baseCardStyle, background: 'linear-gradient(135deg, #e6f7ff 0%, #e6fffb 100%)', border: '1px solid #87e8de' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ ...headingStyle, color: '#00474f' }}>📊 現在の BMI</h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <label style={{ fontSize: '12px', color: '#00474f' }}>身長:</label>
                            <input
                                type="number"
                                step="0.1"
                                value={height}
                                onChange={(e) => handleHeightChange(e.target.value)}
                                style={{ width: '55px', padding: '4px', fontSize: '12px', borderRadius: '6px', border: '1px solid #87e8de' }}
                            />
                            <span style={{ fontSize: '12px', color: '#00474f' }}>cm</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <label style={{ fontSize: '12px', color: '#00474f' }}>年齢:</label>
                            <input
                                type="number"
                                value={age}
                                onChange={(e) => handleAgeChange(e.target.value)}
                                placeholder="25"
                                style={{ width: '45px', padding: '4px', fontSize: '12px', borderRadius: '6px', border: '1px solid #87e8de' }}
                            />
                            <span style={{ fontSize: '12px', color: '#00474f' }}>歳</span>
                        </div>
                    </div>
                </div>

                {currentBMI ? (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                        <span style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#006d75' }}>{currentBMI}</span>
                        <span style={{
                            backgroundColor: bmiLabel.color,
                            color: '#fff',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                        }}>
                            {bmiLabel.text}
                        </span>
                    </div>
                ) : (
                    <p style={{ marginTop: '8px', color: '#8c8c8c', fontSize: '12px' }}>体重データが登録されると BMI が表示されます。</p>
                )}
            </div>

            {/* 🔥 BMR & TDEE 表示カード (ウォームオレンジ系) */}
            <div style={{ ...baseCardStyle, background: 'linear-gradient(135deg, #fff7e6 0%, #fff1f0 100%)', border: '1px solid #ffd591' }}>
                <h3 style={{ ...headingStyle, color: '#873800' }}>🔥 代謝・消費カロリー設定</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px', fontSize: '12px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', color: '#873800' }}>性別:</label>
                        <select
                            value={gender}
                            onChange={(e) => handleGenderChange(e.target.value)}
                            style={{ ...inputStyle, borderColor: '#ffd591' }}
                        >
                            <option value="male">男性</option>
                            <option value="female">女性</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', color: '#873800' }}>運動習慣:</label>
                        <select
                            value={activityLevel}
                            onChange={(e) => handleActivityLevelChange(e.target.value)}
                            style={{ ...inputStyle, borderColor: '#ffd591' }}
                        >
                            <option value="low">ほぼ運動しない</option>
                            <option value="moderate">適度な運動 (週2〜3)</option>
                            <option value="high">激しい運動 (ほぼ毎日)</option>
                        </select>
                    </div>
                </div>

                {/* 🥗 目標PFCバランス */}
                {pfcTarget && (
                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', marginBottom: '15px', border: '1px solid #ffe7ba' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#d46b08', marginBottom: '4px' }}>おすすめの1日目標PFCバランス</div>
                        <p style={{ fontSize: '11px', color: '#8c8c8c', margin: '0 0 10px 0' }}>
                            消費カロリー（{currentTDEE} kcal）基準 (P:20% / F:20% / C:60%)
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', gap: '6px' }}>
                            <div style={{ background: '#e6fffb', padding: '8px', borderRadius: '8px', border: '1px solid #b5f5ec' }}>
                                <span style={{ fontSize: '11px', color: '#006d75' }}>タンパク質 (P)</span>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#13c2c2' }}>
                                    {pfcTarget.protein}<span style={{ fontSize: '0.75rem' }}>g</span>
                                </div>
                            </div>
                            <div style={{ background: '#fffbe6', padding: '8px', borderRadius: '8px', border: '1px solid #ffe58f' }}>
                                <span style={{ fontSize: '11px', color: '#874d00' }}>脂質 (F)</span>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fa8c16' }}>
                                    {pfcTarget.fat}<span style={{ fontSize: '0.75rem' }}>g</span>
                                </div>
                            </div>
                            <div style={{ background: '#fff0f6', padding: '8px', borderRadius: '8px', border: '1px solid #ffd6e7' }}>
                                <span style={{ fontSize: '11px', color: '#9e1068' }}>炭水化物 (C)</span>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ff4d4f' }}>
                                    {pfcTarget.carb}<span style={{ fontSize: '0.75rem' }}>g</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentBMR && currentTDEE ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', textAlign: 'center', gap: '10px' }}>
                        <div style={{ background: '#ffffff', padding: '10px', borderRadius: '10px', border: '1px solid #ffe7ba' }}>
                            <span style={{ fontSize: '11px', color: '#d46b08' }}>基礎代謝 (BMR)</span>
                            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#d46b08' }}>
                                {currentBMR} <span style={{ fontSize: '0.8rem' }}>kcal</span>
                            </div>
                        </div>
                        <div style={{ background: '#ffffff', padding: '10px', borderRadius: '10px', border: '1px solid #ffe7ba' }}>
                            <span style={{ fontSize: '11px', color: '#d46b08' }}>推定消費 (TDEE)</span>
                            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#d46b08' }}>
                                {currentTDEE} <span style={{ fontSize: '0.8rem' }}>kcal</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p style={{ fontSize: '12px', color: '#8c8c8c', margin: 0 }}>
                        ※ 身長・年齢・最新の体重データを登録すると基礎代謝が表示されます。
                    </p>
                )}
            </div>

            {/* 🗺️ 本日の許容カロリー (鮮やかなブルー系) */}
            {targetCalories && weeksToGoal && (
                <div style={{ ...baseCardStyle, background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)', color: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <h3 style={{ ...headingStyle, color: '#ffffff', margin: 0 }}>🗺️ 目標達成ロードマップ</h3>
                        <div style={{ fontSize: '12px' }}>
                            <label style={{ marginRight: '4px', color: '#e6f7ff' }}>ペース:</label>
                            <select
                                value={calorieDeficit}
                                onChange={(e) => setCalorieDeficit(Number(e.target.value))}
                                style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: '#ffffff', color: '#096dd9', fontWeight: 'bold' }}
                            >
                                <option value={300}>じっくり (-300 kcal)</option>
                                <option value={500}>標準 (-500 kcal)</option>
                                <option value={700}>ハード (-700 kcal)</option>
                            </select>
                        </div>
                    </div>

                    <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#e6f7ff' }}>目標体重 <strong>{goal.target_weight} kg</strong> まで: 約 <strong>{weeksToGoal} 週間</strong></p>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#e6f7ff' }}>1日の目標摂取量: <strong>{targetCalories} kcal</strong></p>

                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <span style={{ fontSize: '12px', color: '#595959' }}>本日の残り許容カロリー</span>
                        <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: remainingCalories >= 0 ? '#389e0d' : '#cf1322' }}>
                            {remainingCalories} <span style={{ fontSize: '0.9rem' }}>kcal</span> {remainingCalories < 0 && '(オーバー！)'}
                        </div>
                    </div>
                </div>
            )}

            {/* 🍱 食事記録入力＆一覧カード (パープル・ピンク系) */}
            <div style={{ ...baseCardStyle, background: '#ffffff', border: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ ...headingStyle, color: '#722ed1' }}>🍱 食事記録</h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                        <button type="button" onClick={() => changeDate(-1)} style={{ padding: '4px 8px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #d3ade6', background: '#f9f0ff', color: '#722ed1' }}>◀</button>
                        <input
                            type="date"
                            value={mealForm.recorded_at}
                            onChange={(e) => setMealForm({ ...mealForm, recorded_at: e.target.value })}
                            style={{ padding: '4px 6px', fontSize: '12px', borderRadius: '6px', border: '1px solid #d3ade6' }}
                        />
                        <button type="button" onClick={() => changeDate(1)} style={{ padding: '4px 8px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #d3ade6', background: '#f9f0ff', color: '#722ed1' }}>▶</button>
                        <button type="button" onClick={handleSetToday} style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer', borderRadius: '6px', border: 'none', background: '#722ed1', color: '#ffffff', fontWeight: 'bold' }}>今日</button>
                    </div>
                </div>

                {/* 登録フォーム */}
                <form onSubmit={handleMealSubmit} style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                        <select
                            value={mealForm.meal_type}
                            onChange={(e) => setMealForm({ ...mealForm, meal_type: e.target.value })}
                            style={inputStyle}
                        >
                            <option value="breakfast">朝食</option>
                            <option value="lunch">昼食</option>
                            <option value="dinner">夕食</option>
                            <option value="snack">間食</option>
                        </select>

                        <input
                            type="text"
                            placeholder="料理名 (例: 鮭おにぎり)"
                            value={mealForm.name}
                            onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '8px' }}>
                        <input
                            type="number"
                            placeholder="kcal"
                            value={mealForm.calories}
                            onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })}
                            style={inputStyle}
                        />
                        <input
                            type="number"
                            placeholder="P(g)"
                            value={mealForm.protein}
                            onChange={(e) => setMealForm({ ...mealForm, protein: e.target.value })}
                            style={inputStyle}
                        />
                        <input
                            type="number"
                            placeholder="F(g)"
                            value={mealForm.fat}
                            onChange={(e) => setMealForm({ ...mealForm, fat: e.target.value })}
                            style={inputStyle}
                        />
                        <input
                            type="number"
                            placeholder="C(g)"
                            value={mealForm.carbs}
                            onChange={(e) => setMealForm({ ...mealForm, carbs: e.target.value })}
                            style={inputStyle}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
                            color: '#fff',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            boxShadow: '0 2px 6px rgba(114, 46, 209, 0.3)'
                        }}
                    >
                        食事を追加する
                    </button>
                </form>

                {/* 登録済み一覧 */}
                {mealLogs.length === 0 ? (
                    <p style={{ fontSize: '12px', color: '#8c8c8c', margin: 0 }}>まだ今日の食事記録はありません。</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {mealLogs.map((log) => (
                            <li key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f5f5f5', fontSize: '13px' }}>
                                <div>
                                    <strong>[{log.meal_type === 'breakfast' ? '朝' : log.meal_type === 'lunch' ? '昼' : log.meal_type === 'dinner' ? '夕' : '間'}]</strong> {log.name}
                                    <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: '2px' }}>
                                        {log.calories || 0} kcal (P:{log.protein || 0}g F:{log.fat || 0}g C:{log.carbs || 0}g)
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleMealDelete(log.id)}
                                    style={{ background: '#ff4d4f', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                                >
                                    削除
                                </button>
                                <button
                                    onClick={() => handleEditClick(log)}
                                    style={{ background: '#ff4d4f', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                                >
                                    編集
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* 🎯 目標設定・更新フォーム */}
            <form onSubmit={handleGoalSubmit} style={{ ...baseCardStyle, background: '#ffffff', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ ...headingStyle, color: '#389e0d' }}>🎯 {goal ? '目標を更新する' : '新しい目標を設定する'}</h3>
                {message && <p style={{ color: '#52c41a', margin: 0, fontSize: '12px' }}>{message}</p>}

                <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#595959', marginBottom: '4px' }}>目標体重 (kg): </label>
                    <input
                        type="number"
                        step="0.01"
                        value={targetWeight}
                        onChange={(e) => setTargetWeight(e.target.value)}
                        required
                        placeholder="例: 60.0"
                        style={inputStyle}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#595959', marginBottom: '4px' }}>メモ: </label>
                    <input
                        type="text"
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="例: 年内に達成する！"
                        style={inputStyle}
                    />
                </div>

                <button type="submit" style={{ background: '#52c41a', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {goal ? '目標を更新' : '目標を登録'}
                </button>
            </form>

            {/* ⚖️ 体重記録フォーム */}
            <form onSubmit={handleWeightSubmit} style={{ ...baseCardStyle, background: '#ffffff', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ ...headingStyle, color: '#1890ff' }}>⚖️ 今日の体重を記録する</h3>
                {logMessage && <p style={{ color: '#52c41a', margin: 0, fontSize: '12px' }}>{logMessage}</p>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#595959', marginBottom: '4px' }}>日付: </label>
                        <input
                            type="date"
                            value={recordedAt}
                            onChange={(e) => setRecordedAt(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#595959', marginBottom: '4px' }}>体重 (kg): </label>
                        <input
                            type="number"
                            step="0.01"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            required
                            placeholder="例: 65.5"
                            style={inputStyle}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#595959', marginBottom: '4px' }}>メモ: </label>
                    <input
                        type="text"
                        value={weightMemo}
                        onChange={(e) => setWeightMemo(e.target.value)}
                        placeholder="例: 食べ過ぎた"
                        style={inputStyle}
                    />
                </div>

                <button type="submit" style={{ background: '#1890ff', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    体重を記録
                </button>
            </form>

            {/* 📈 体重推移グラフ */}
            <div style={{ ...baseCardStyle, background: '#ffffff', border: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ ...headingStyle, color: '#262626' }}>📈 体重の推移</h3>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {['daily', 'weekly', 'monthly'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                style={{
                                    padding: '4px 10px',
                                    fontSize: '12px',
                                    border: '1px solid #1890ff',
                                    borderRadius: '6px',
                                    backgroundColor: viewMode === mode ? '#1890ff' : '#fff',
                                    color: viewMode === mode ? '#fff' : '#1890ff',
                                    cursor: 'pointer'
                                }}
                            >
                                {mode === 'daily' ? '日' : mode === 'weekly' ? '週' : '月'}
                            </button>
                        ))}
                    </div>
                </div>

                {weightLogs.length > 0 ? (
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getChartData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="recorded_at" fontSize={11} stroke="#8c8c8c" />
                                <YAxis domain={['dataMin - 1', 'dataMax + 1']} fontSize={11} stroke="#8c8c8c" />
                                <Tooltip formatter={(value) => [`${value} kg`, '平均体重']} />
                                {goal?.target_weight && (
                                    <ReferenceLine
                                        y={Number(goal.target_weight)}
                                        label={{ value: '目標', fill: '#ff4d4f', fontSize: 11, position: 'top' }}
                                        stroke="#ff4d4f"
                                        strokeDasharray="3 3"
                                    />
                                )}
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="#1890ff"
                                    strokeWidth={3}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p style={{ fontSize: '12px', color: '#8c8c8c' }}>データが登録されるとグラフが表示されます。</p>
                )}
            </div>

            {/* 📜 体重の履歴一覧 */}
            <div style={{ ...baseCardStyle, background: '#ffffff', border: '1px solid #f0f0f0' }}>
                <h3 style={{ ...headingStyle, color: '#262626' }}>📜 体重の履歴</h3>
                {weightLogs.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {weightLogs.map((log) => (
                            <li key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f5f5f5', fontSize: '13px' }}>
                                <div>
                                    <span>{log.recorded_at} : <strong>{Number(log.weight).toFixed(2)} kg</strong></span>
                                    {log.memo && <span style={{ color: '#8c8c8c', marginLeft: '6px', fontSize: '11px' }}>({log.memo})</span>}
                                </div>
                                <button
                                    onClick={() => handleDelete(log.id)}
                                    style={{ backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', fontSize: '11px' }}
                                >
                                    削除
                                </button>
                                <button
                                    onClick={() => handleEditWeight(log)}
                                    style={{ backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', fontSize: '11px' }}
                                >
                                    編集
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ fontSize: '12px', color: '#8c8c8c', margin: 0 }}>まだ体重の記録がありません。</p>
                )}
            </div>
            <button
                type="button"
                onClick={handleLogout}
                style={{
                    backgroundColor: '#ff4d4f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    width: '100%',
                    marginTop: '20px'
                }}
            >
                ログアウト
            </button>
        </div>
    );
}