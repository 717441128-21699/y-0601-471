import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Baby,
  CalendarClock,
  ChefHat,
  Shield,
  DollarSign,
  Wrench,
  BarChart3,
  Settings,
  Bell,
  Users,
  ClipboardList,
} from 'lucide-react';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const menuItems: MenuItem[] = [
  { path: '/', label: '数据总览', icon: <LayoutDashboard size={20} /> },
  { path: '/children', label: '幼儿管理', icon: <Baby size={20} /> },
  { path: '/attendance', label: '考勤签到', icon: <ClipboardList size={20} />, badge: 3 },
  { path: '/schedule', label: '排课排班', icon: <CalendarClock size={20} /> },
  { path: '/recipe', label: '营养食谱', icon: <ChefHat size={20} /> },
  { path: '/inventory', label: '库存采购', icon: <Users size={20} />, badge: 2 },
  { path: '/security', label: '安全监控', icon: <Shield size={20} />, badge: 1 },
  { path: '/finance', label: '财务管理', icon: <DollarSign size={20} /> },
  { path: '/maintenance', label: '设备维保', icon: <Wrench size={20} /> },
  { path: '/statistics', label: '统计报表', icon: <BarChart3 size={20} /> },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
            <Baby className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-base">智慧幼儿园</h1>
            <p className="text-xs text-gray-500">综合管理系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 mb-2">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">功能模块</span>
        </div>
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? 'text-primary-500' : 'text-gray-400'}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="bg-danger-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
          <Settings size={20} className="text-gray-400" />
          <span>系统设置</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
