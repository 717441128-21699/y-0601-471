import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Baby, Phone, AlertTriangle, Bed, Calendar } from 'lucide-react';
import { children, classes } from '../data/mockData';
import { Child } from '../types';

const ChildrenManagement: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const filteredChildren = children.filter(child => {
    const matchesClass = selectedClass === 'all' || child.className === selectedClass;
    const matchesSearch = child.name.includes(searchText) || child.id.includes(searchText);
    const matchesStatus = activeTab === 'all' || 
      (activeTab === 'in_school' && child.status === 'in_school') ||
      (activeTab === 'leave' && child.status === 'leave') ||
      (activeTab === 'absent' && child.status === 'absent') ||
      (activeTab === 'special' && child.allergies.length > 0);
    return matchesClass && matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Child['status']) => {
    const styles: Record<string, string> = {
      in_school: 'bg-success-100 text-success-600',
      leave: 'bg-warning-100 text-warning-600',
      absent: 'bg-gray-100 text-gray-600',
      sick: 'bg-danger-100 text-danger-600',
    };
    const labels: Record<string, string> = {
      in_school: '在园',
      leave: '请假',
      absent: '缺勤',
      sick: '病假',
    };
    return <span className={`status-badge ${styles[status]}`}>{labels[status]}</span>;
  };

  const stats = {
    total: children.length,
    inSchool: children.filter(c => c.status === 'in_school').length,
    leave: children.filter(c => c.status === 'leave').length,
    absent: children.filter(c => c.status === 'absent').length,
    special: children.filter(c => c.allergies.length > 0 || c.specialConstitution.length > 0).length,
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-5 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">幼儿总数</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}人</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">在园</p>
          <p className="text-2xl font-bold text-success-600 mt-1">{stats.inSchool}人</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">请假</p>
          <p className="text-2xl font-bold text-warning-600 mt-1">{stats.leave}人</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">缺勤</p>
          <p className="text-2xl font-bold text-gray-500 mt-1">{stats.absent}人</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">特殊体质</p>
          <p className="text-2xl font-bold text-danger-500 mt-1">{stats.special}人</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="搜索幼儿姓名/编号..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="select-field w-40"
            >
              <option value="all">全部班级</option>
              {classes.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary flex items-center gap-1">
              <Filter size={16} />
              筛选
            </button>
            <button className="btn-primary flex items-center gap-1">
              <Plus size={16} />
              新增幼儿
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 border-b border-gray-100">
          {[
            { key: 'all', label: '全部', count: stats.total },
            { key: 'in_school', label: '在园', count: stats.inSchool },
            { key: 'leave', label: '请假', count: stats.leave },
            { key: 'absent', label: '缺勤', count: stats.absent },
            { key: 'special', label: '特殊体质', count: stats.special },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} <span className="text-xs">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">幼儿信息</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">班级</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">床位</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">过敏/特殊体质</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">监护人</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredChildren.map(child => (
                <tr key={child.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full flex items-center justify-center">
                        <Baby className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{child.name}</p>
                        <p className="text-xs text-gray-500">{child.gender} · {child.age}岁 · {child.birthDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-700">{child.className}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Bed size={14} />
                      <span>{child.bedNumber || '-'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {child.allergies.length > 0 || child.specialConstitution.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {child.allergies.map(a => (
                          <span key={a} className="px-2 py-0.5 bg-danger-50 text-danger-600 rounded text-xs">
                            <AlertTriangle size={10} className="inline mr-0.5" />
                            {a}过敏
                          </span>
                        ))}
                        {child.specialConstitution.map(s => (
                          <span key={s} className="px-2 py-0.5 bg-warning-50 text-warning-600 rounded text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm text-gray-800">{child.guardianName}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone size={10} />
                        {child.guardianPhone}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(child.status)}
                  </td>
                  <td className="py-3 px-4">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical size={16} className="text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">共 {filteredChildren.length} 条记录</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded">上一页</button>
            <button className="px-3 py-1 text-sm bg-primary-500 text-white rounded">1</button>
            <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded">2</button>
            <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded">下一页</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">智能分班推荐</h3>
          <p className="text-sm text-gray-500 mb-4">根据幼儿年龄、特殊体质自动推荐班级和床位</p>
          <div className="space-y-3">
            {classes.map(cls => (
              <div key={cls.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{cls.name}</p>
                    <p className="text-xs text-gray-500">{cls.grade} · {cls.headTeacher} 带班</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">{cls.currentCount}/{cls.capacity}</p>
                    <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-primary-500 h-1.5 rounded-full"
                        style={{ width: `${(cls.currentCount / cls.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">最近入托</h3>
          <div className="space-y-3">
            {children.slice(0, 5).map(child => (
              <div key={child.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full flex items-center justify-center">
                  <Baby className="text-white" size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{child.name}</p>
                  <p className="text-xs text-gray-500">{child.className}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">入托日期</p>
                  <p className="text-xs text-gray-700 flex items-center gap-1">
                    <Calendar size={10} />
                    {child.enrollmentDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildrenManagement;
