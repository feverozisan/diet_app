// src/App.test.jsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('Appコンポーネントのテスト', () => {
  it('エラーなく画面がレンダリングされること', () => {
    render(<App />);
    
    // ※もしApp.jsxの中に特定の文字（例: 「ログイン」や「Diet App」など）があれば、
    // それが画面に存在するかチェックするテストも書けます。
    // 例: expect(screen.getByText('Diet App')).toBeInTheDocument();
  });
});