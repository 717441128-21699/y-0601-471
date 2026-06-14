import React, { useMemo } from 'react';
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
  AlertTriangle,
  ShoppingCart,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const Sidebar: React.FC = () => {
  const { bills, inventoryItems, purchaseOrders, alerts, swapRequests } = useApp();

  const todoCounts = useMemo(() => {
    const todoFinance = bills.filter(b => b.status !== 'paid').length;
    const todoInventory = inventoryItems.filter(i => i.status === 'low_stock' || i.status === 'out_of_stock').length;
    const todoPurchase = purchaseOrders.filter(o => o.status === 'pending').length;
    const todoSecurity = alerts.filter(a => a.status === 'active' || a.status === 'acknowledged').length;
    const todoSchedule = swapRequests.filter(r => r.status === 'pending').length;
    return {
      todo: todoFinance + todoInventory + todoPurchase + todoSecurity + todoSchedule,
      finance: todoFinance,
      inventory: todoInventory,
      purchase: todoPurchase,
      security: todoSecurity,
      schedule: todoSchedule,
    };
  }, [bills, inventoryItems, purchaseOrders, alerts, swapRequests]);

  const menuItems = [
    { path: '/', label: '数据总览', icon: <LayoutDashboard size={20} /> },
    { path: '/todo', label: '待办中心', icon: <Bell size={20} />, badge: todoCounts.todo },
    { path: '/children', label: '幼儿管理', icon: <Baby size={20} /> },
    { path: '/attendance', label: '考勤签到', icon: <ClipboardList size={20} /> },
    { path: '/schedule', label: '排课排班', icon: <CalendarClock size={20} />, badge: todoCounts.schedule },
    { path: '/recipe', label: '营养食谱', icon: <ChefHat size={20} /> },
    { path: '/inventory', label: '库存采购', icon: <ShoppingCart size={20} />, badge: todoCounts.inventory + todoCounts.purchase },
    { path: '/security', label: '安全监控', icon: <Shield size={20} />, badge: todoCounts.security },
    { path: '/finance', label: '财务管理', icon: <DollarSign size={20} />, badge: todoCounts.finance },
    { path: '/maintenance', label: '设备维保', icon: <Wrench size={20} /> },
    { path: '/statistics', label: '统计报表', icon: <BarChart3 size={20} /> },
  ];

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
                    {item.badge && item.badge > 0 && (
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
