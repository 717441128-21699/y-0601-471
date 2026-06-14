import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ChildrenManagement from './pages/ChildrenManagement';
import Attendance from './pages/Attendance';
import Schedule from './pages/Schedule';
import Recipe from './pages/Recipe';
import Inventory from './pages/Inventory';
import Security from './pages/Security';
import Finance from './pages/Finance';
import Maintenance from './pages/Maintenance';
import Statistics from './pages/Statistics';

const pageTitles: Record<string, string> = {
  '/': '数据总览',
  '/children': '幼儿管理',
  '/attendance': '考勤签到',
  '/schedule': '排课排班',
  '/recipe': '营养食谱',
  '/inventory': '库存采购',
  '/security': '安全监控',
  '/finance': '财务管理',
  '/maintenance': '设备维保',
  '/statistics': '统计报表',
};

const App: React.FC = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || '智慧幼儿园管理系统';

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/children" element={<ChildrenManagement />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/recipe" element={<Recipe />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/security" element={<Security />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
