import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
  Camera,
  CreditCard,
  FileText,
  Download,
  Filter,
} from 'lucide-react';
import { attendanceRecords, children, healthCheckRecords } from '../data/mockData';

const Attendance: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('checkin');

  const todayRecords = attendanceRecords;

  const stats = {
    total: children.length,
    present: todayRecords.filter(r => r.status === 'present').length,
    late: todayRecords.filter(r => r.status === 'late').length,
    absent: todayRecords.filter(r => r.status === 'absent').length,
    leave: todayRecords.filter(r => r.status === 'leave').length,
    checkedOut: todayRecords.filter(r => r.checkOutTime).length,
  };

  const attendanceRate = ((stats.present + stats.late) / stats.total * 100).toFixed(1);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      present: 'bg-success-100 text-success-600',
      late: 'bg-warning-100 text-warning-600',
      absent: 'bg-gray-100 text-gray-600',
      leave: 'bg-primary-100 text-primary-600',
      early_leave: 'bg-warning-100 text-warning-600',
    };
    const labels: Record<string, string> = {
      present: '正常',
      late: '迟到',
      absent: '缺勤',
      leave: '请假',
      early_leave: '早退',
    };
    return <span className={`status-badge ${styles[status]}`}>{labels[status]}</span>;
  };

  const getMethodIcon = (method?: string) => {
    switch (method) {
      case 'face': return <Camera size={14} className="text-primary-500" />;
      case 'card': return <CreditCard size={14} className="text-success-500" />;
      case 'manual': return <FileText size={14} className="text-gray-500" />;
      default: return null;
    }
  };

  const getMethodLabel = (method?: string) => {
    switch (method) {
      case 'face': return '人脸识别';
      case 'card': return '刷卡';
      case 'manual': return '手动登记';
      default: return '-';
    }
  };

  const filteredRecords = todayRecords.filter(r => {
    const matchesClass = selectedClass === 'all' || r.className === selectedClass;
    const matchesSearch = r.childName.includes(searchText);
    return matchesClass && matchesSearch;
  });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-6 gap-4">
        <div className="card p-4 text-center">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <UserCheck className="text-primary-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.present}</p>
          <p className="text-sm text-gray-500">已入园</p>
        </div>
        <div className="card p-4 text-center">
          <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Clock className="text-warning-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-warning-600">{stats.late}</p>
          <p className="text-sm text-gray-500">迟到</p>
        </div>
        <div className="card p-4 text-center">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <UserX className="text-gray-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-600">{stats.absent}</p>
          <p className="text-sm text-gray-500">缺勤</p>
        </div>
        <div className="card p-4 text-center">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FileText className="text-purple-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.leave}</p>
          <p className="text-sm text-gray-500">请假</p>
        </div>
        <div className="card p-4 text-center">
          <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <UserCheck className="text-success-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-success-600">{stats.checkedOut}</p>
          <p className="text-sm text-gray-500">已离园</p>
        </div>
        <div className="card p-4 text-center">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Calendar className="text-primary-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-primary-600">{attendanceRate}%</p>
          <p className="text-sm text-gray-500">出勤率</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field w-40"
              />
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="select-field w-40"
            >
              <option value="all">全部班级</option>
              <option value="太阳一班">太阳一班</option>
              <option value="月亮二班">月亮二班</option>
              <option value="星星三班">星星三班</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="搜索幼儿姓名..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9 pr-4 py-2 w-52 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary flex items-center gap-1">
              <Filter size={16} />
              高级筛选
            </button>
            <button className="btn-secondary flex items-center gap-1">
              <Download size={16} />
              导出报表
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 border-b border-gray-100">
          {[
            { key: 'checkin', label: '入园签到' },
            { key: 'checkout', label: '离园签退' },
            { key: 'health', label: '晨检记录' },
            { key: 'abnormal', label: '异常记录' },
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
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'checkin' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">幼儿姓名</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">班级</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">签到时间</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">签到方式</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">晨检结果</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(record => {
                  const health = healthCheckRecords.find(h => h.childId === record.childId);
                  return (
                    <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">{record.childName[0]}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-800">{record.childName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{record.className}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-800">{record.checkInTime || '-'}</span>
                      </td>
                      <td className="py-3 px-4">
                        {record.checkInMethod ? (
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            {getMethodIcon(record.checkInMethod)}
                            {getMethodLabel(record.checkInMethod)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                      <td className="py-3 px-4">
                        {health ? (
                          <span className={`status-badge ${
                            health.result === 'normal' ? 'bg-success-100 text-success-600' :
                            health.result === 'need_attention' ? 'bg-warning-100 text-warning-600' :
                            'bg-danger-100 text-danger-600'
                          }`}>
                            {health.result === 'normal' ? '正常' : health.result === 'need_attention' ? '需关注' : '异常'}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">未检查</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">幼儿姓名</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">班级</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">体温</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">症状检查</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">结果</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">检查医生</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">备注</th>
                </tr>
              </thead>
              <tbody>
                {healthCheckRecords.map(h => (
                  <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-800">{h.childName}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{h.className}</td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-medium ${
                        h.hasFever ? 'text-danger-500' : 'text-gray-800'
                      }`}>
                        {h.temperature}°C
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs ${h.hasCough ? 'bg-warning-100 text-warning-600' : 'bg-gray-100 text-gray-400'}`}>
                          咳嗽
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${h.hasFever ? 'bg-danger-100 text-danger-600' : 'bg-gray-100 text-gray-400'}`}>
                          发烧
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${h.hasRash ? 'bg-warning-100 text-warning-600' : 'bg-gray-100 text-gray-400'}`}>
                          皮疹
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${h.hasDiarrhea ? 'bg-warning-100 text-warning-600' : 'bg-gray-100 text-gray-400'}`}>
                          腹泻
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`status-badge ${
                        h.result === 'normal' ? 'bg-success-100 text-success-600' :
                        h.result === 'need_attention' ? 'bg-warning-100 text-warning-600' :
                        'bg-danger-100 text-danger-600'
                      }`}>
                        {h.result === 'normal' ? '正常' : h.result === 'need_attention' ? '需关注' : '异常'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{h.examiner}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{h.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'abnormal' && (
          <div className="space-y-3">
            {healthCheckRecords.filter(h => h.result !== 'normal').map(h => (
              <div key={h.id} className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-danger-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="text-danger-500" size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-danger-700">{h.childName} - {h.className}</h4>
                      <span className="text-xs text-gray-500">{h.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">体温: {h.temperature}°C</p>
                    <div className="flex gap-2 mt-2">
                      {h.hasCough && <span className="px-2 py-0.5 bg-warning-100 text-warning-600 rounded text-xs">咳嗽</span>}
                      {h.hasFever && <span className="px-2 py-0.5 bg-danger-100 text-danger-600 rounded text-xs">发烧</span>}
                      {h.hasRash && <span className="px-2 py-0.5 bg-warning-100 text-warning-600 rounded text-xs">皮疹</span>}
                      {h.hasDiarrhea && <span className="px-2 py-0.5 bg-warning-100 text-warning-600 rounded text-xs">腹泻</span>}
                    </div>
                    {h.notes && <p className="text-sm text-gray-500 mt-2">备注: {h.notes}</p>}
                    <div className="flex gap-2 mt-3">
                      <button className="px-3 py-1 bg-danger-500 text-white text-xs rounded hover:bg-danger-600">
                        通知家长
                      </button>
                      <button className="px-3 py-1 bg-white text-gray-600 text-xs rounded border border-gray-200 hover:bg-gray-50">
                        详细记录
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {healthCheckRecords.filter(h => h.result !== 'normal').length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <AlertTriangle size={48} className="mx-auto mb-3 opacity-30" />
                <p>今日无异常晨检记录</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">实时签到大屏</h3>
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-6 text-white">
            <div className="text-center mb-4">
              <p className="text-5xl font-bold">{new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-primary-100 mt-1">{new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold">{stats.present + stats.late}</p>
                <p className="text-sm text-primary-100">已入园</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{attendanceRate}%</p>
                <p className="text-sm text-primary-100">出勤率</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.absent + stats.leave}</p>
                <p className="text-sm text-primary-100">未到</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">缺勤统计</h3>
          <div className="space-y-4">
            {['太阳一班', '月亮二班', '星星三班'].map(cls => {
              const classChildren = children.filter(c => c.className === cls);
              const classAttendance = todayRecords.filter(r => r.className === cls);
              const present = classAttendance.filter(r => r.status === 'present' || r.status === 'late').length;
              const rate = classChildren.length > 0 ? ((present / classChildren.length) * 100).toFixed(1) : '0';
              return (
                <div key={cls}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{cls}</span>
                    <span className="text-sm text-gray-500">{present}/{classChildren.length} ({rate}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        Number(rate) >= 95 ? 'bg-success-500' :
                        Number(rate) >= 85 ? 'bg-primary-500' : 'bg-warning-500'
                      }`}
                      style={{ width: `${rate}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
