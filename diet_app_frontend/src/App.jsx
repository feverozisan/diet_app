import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './app/login/page.tsx';
import Signup from './app/signup/page.tsx';
import Dashboard from './Dashboard';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </HashRouter>
  );
}

export default App;