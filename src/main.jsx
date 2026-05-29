import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import ProcessPage from './pages/ProcessPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import DetailPage from './pages/DetailPage.jsx';
import LogsPage from './pages/LogsPage.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<ProcessPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/meeting/:id" element={<DetailPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
