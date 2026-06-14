import React, { useState } from 'react';
import { Bell, Search, User, ChevronDown } from 'lucide-react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    { id: 1, type: 'alert', title: '安全警报', message: '发现非授权人员试图进入', time: '5分钟前' },
    { id: 2, type: 'info', title: '库存提醒', message: '牛奶库存低于安全线', time: '30分钟前' },
    { id: 3, type: 'info', title: '调班申请', message: '李芳老师申请调班待审批', time: '1小时前' },
  ];

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="搜索幼儿、班级、教师..."
            className="w-72 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">通知消息</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        n.type === 'alert' ? 'bg-danger-500' : 'bg-primary-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-1 truncate">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-100">
                <button className="text-sm text-primary-500 hover:text-primary-600 font-medium w-full text-center">
                  查看全部通知
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-200"></div>

        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">管理员</p>
              <p className="text-xs text-gray-500">系统管理员</p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">个人中心</button>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">修改密码</button>
              <div className="border-t border-gray-100 my-1"></div>
              <button className="w-full px-4 py-2 text-left text-sm text-danger-500 hover:bg-danger-50">退出登录</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
