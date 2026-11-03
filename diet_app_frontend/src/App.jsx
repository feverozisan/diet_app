import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './app/login/page.tsx';
import Signup from './app/signup/page.tsx'; // 👈 追加
import Dashboard from './Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} /> {/* 👈 追加 */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;