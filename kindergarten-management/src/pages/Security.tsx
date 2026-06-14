import React, { useState } from 'react';
import {
  Shield,
  Camera,
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Clock,
  MapPin,
  Video,
  Volume2,
  Eye,
  MoreVertical,
  Search,
  Filter,
} from 'lucide-react';
import { securityAlerts, children } from '../data/mockData';

const Security: React.FC = () => {
  const [activeTab, setActiveTab] = useState('alerts');
  const [alertStatus, setAlertStatus] = useState('all');
  const [searchText, setSearchText] = useState('');

  const stats = {
    total: securityAlerts.length,
    active: securityAlerts.filter(a => a.status === 'active').length,
    acknowledged: securityAlerts.filter(a => a.status === 'acknowledged').length,
    resolved: securityAlerts.filter(a => a.status === 'resolved').length,
  };

  const filteredAlerts = securityAlerts.filter(alert => {
    const matchesStatus = alertStatus === 'all' || alert.status === alertStatus;
    const matchesSearch = alert.title.includes(searchText) || alert.description.includes(searchText);
    return matchesStatus && matchesSearch;
  });

  const cameras = [
    { id: 1, name: '大门入口', location: '幼儿园正门', status: 'online', hasAlert: false },
    { id: 2, name: '操场全景', location: '大操场', status: 'online', hasAlert: false },
    { id: 3, name: '教学楼走廊', location: '教学楼2楼', status: 'warning', hasAlert: true },
    { id: 4, name: '食堂后厨', location: '食堂', status: 'online', hasAlert: false },
    { id: 5, name: '午休室', location: '宿舍楼A栋', status: 'online', hasAlert: false },
    { id: 6, name: '沙水区', location: '户外活动区', status: 'online', hasAlert: false },
    { id: 7, name: '停车场', location: '校门西侧', status: 'offline', hasAlert: false },
    { id: 8, name: '保健室', location: '1楼东侧', status: 'online', hasAlert: false },
  ];

  const pickupRecords = [
    { id: 1, childName: '张小明', className: '太阳一班', time: '16:30', person: '张伟', relation: '父亲', method: 'face', authorized: true },
    { id: 2, childName: '李小红', className: '太阳一班', time: '16:35', person: '李芳', relation: '母亲', method: 'face', authorized: true },
    { id: 3, childName: '王小强', className: '月亮二班', time: '16:40', person: '王建国', relation: '父亲', method: 'card', authorized: true },
    { id: 4, childName: '陈小美', className: '星星三班', time: '16:45', person: '陈美丽', relation: '母亲', method: 'face', authorized: true },
    { id: 5, childName: '赵小婷', className: '太阳一班', time: '17:00', person: '未知人员', relation: '未知', method: 'face', authorized: false },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return '紧急';
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return severity;
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      unauthorized_pickup: '非授权接送',
      timeout_pickup: '超时未接',
      stranger_detected: '陌生人识别',
      equipment_abnormal: '设备异常',
      fire_alarm: '消防告警',
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Bell className="text-red-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">总告警数</p>
              <p className="text-xl font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-danger-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">待处理</p>
              <p className="text-xl font-bold text-danger-500">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <Eye className="text-warning-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">处理中</p>
              <p className="text-xl font-bold text-warning-600">{stats.acknowledged}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-success-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">已解决</p>
              <p className="text-xl font-bold text-success-600">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="搜索告警..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9 pr-4 py-2 w-56 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={alertStatus}
              onChange={(e) => setAlertStatus(e.target.value)}
              className="select-field w-32"
            >
              <option value="all">全部状态</option>
              <option value="active">待处理</option>
              <option value="acknowledged">处理中</option>
              <option value="resolved">已解决</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary flex items-center gap-1">
              <Volume2 size={16} />
              告警声音
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 border-b border-gray-100">
          {[
            { key: 'alerts', label: '告警中心' },
            { key: 'cameras', label: '监控画面' },
            { key: 'pickup', label: '接送记录' },
            { key: 'access', label: '门禁管理' },
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
              {tab.key === 'alerts' && stats.active > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-danger-500 text-white text-xs rounded-full">
                  {stats.active}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 border rounded-xl transition-shadow hover:shadow-sm ${
                  alert.status === 'active'
                    ? 'border-danger-300 bg-danger-50/50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(alert.severity)} ${
                    alert.status === 'active' ? 'animate-pulse' : ''
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-800">{alert.title}</h4>
                        <span className={`status-badge ${
                          alert.severity === 'high' || alert.severity === 'critical'
                            ? 'bg-danger-100 text-danger-600'
                            : alert.severity === 'medium'
                            ? 'bg-warning-100 text-warning-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {getSeverityLabel(alert.severity)}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                          {getTypeLabel(alert.type)}
                        </span>
                      </div>
                      <span className={`status-badge ${
                        alert.status === 'active' ? 'bg-danger-100 text-danger-600' :
                        alert.status === 'acknowledged' ? 'bg-warning-100 text-warning-600' :
                        'bg-success-100 text-success-600'
                      }`}>
                        {alert.status === 'active' ? '待处理' : alert.status === 'acknowledged' ? '处理中' : '已解决'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{alert.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {alert.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(alert.timestamp).toLocaleString('zh-CN')}
                      </span>
                      {alert.handler && (
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          处理人: {alert.handler}
                        </span>
                      )}
                    </div>
                    {alert.status === 'active' && (
                      <div className="flex gap-2 mt-4">
                        <button className="btn-primary text-xs flex items-center gap-1">
                          <CheckCircle size={14} />
                          确认告警
                        </button>
                        <button className="btn-secondary text-xs flex items-center gap-1">
                          <Eye size={14} />
                          查看详情
                        </button>
                        <button className="btn-secondary text-xs flex items-center gap-1">
                          <Volume2 size={14} />
                          声光报警
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'cameras' && (
          <div>
            <div className="grid grid-cols-4 gap-4">
              {cameras.map(camera => (
                <div key={camera.id} className="rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="relative bg-gray-800 aspect-video flex items-center justify-center">
                    {camera.status === 'offline' ? (
                      <div className="text-center">
                        <Video className="text-gray-600 mx-auto mb-2" size={32} />
                        <p className="text-gray-500 text-sm">设备离线</p>
                      </div>
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                          <Camera className="text-gray-500 opacity-30" size={48} />
                        </div>
                        <div className="absolute top-2 left-2 flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${camera.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                          <span className="text-white text-xs bg-black/40 px-1.5 py-0.5 rounded">
                            {camera.status === 'online' ? 'LIVE' : '警告'}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="text-white text-xs bg-black/40 px-1.5 py-0.5 rounded">
                            {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        {camera.hasAlert && (
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="bg-red-500/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                              <AlertTriangle size={12} />
                              画面异常
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="p-3 bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{camera.name}</p>
                        <p className="text-xs text-gray-500">{camera.location}</p>
                      </div>
                      <button className="p-1.5 hover:bg-gray-100 rounded">
                        <MoreVertical size={16} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pickup' && (
          <div>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Shield className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-blue-800">安全接送验证</p>
                  <p className="text-sm text-blue-600 mt-1">
                    所有接送人员需通过人脸识别或刷卡验证，非授权人员接送将触发告警并通知家长
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">幼儿信息</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">班级</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">接送时间</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">接送人</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">关系</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">验证方式</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {pickupRecords.map(record => (
                    <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">{record.childName[0]}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-800">{record.childName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{record.className}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700 flex items-center gap-1">
                          <Clock size={14} className="text-gray-400" />
                          {record.time}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800">{record.person}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{record.relation}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          {record.method === 'face' ? <Camera size={14} /> : <Shield size={14} />}
                          {record.method === 'face' ? '人脸识别' : '刷卡'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {record.authorized ? (
                          <span className="status-badge bg-success-100 text-success-600">已授权</span>
                        ) : (
                          <span className="status-badge bg-danger-100 text-danger-600">未授权</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'access' && (
          <div className="text-center py-12 text-gray-400">
            <Shield size={48} className="mx-auto mb-3 opacity-30" />
            <p>门禁管理功能开发中...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Security;
