import React, { useState, useMemo } from 'react';
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
  Plus,
  Trash2,
  Power,
  PowerOff,
  UserPlus,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import { SecurityAlert, PickupRecord } from '../types';

const Security: React.FC = () => {
  const {
    alerts,
    children,
    pickupRecords,
    authorizedPersons,
    addAlert,
    updateAlert,
    addPickupRecord,
    addAuthorizedPerson,
    updateAuthorizedPerson,
    deleteAuthorizedPerson,
  } = useApp();

  const [activeTab, setActiveTab] = useState('alerts');
  const [alertStatus, setAlertStatus] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [addPersonModalOpen, setAddPersonModalOpen] = useState(false);
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [alarmPlaying, setAlarmPlaying] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [newPersonForm, setNewPersonForm] = useState({
    name: '',
    relation: '',
    phone: '',
    idCard: '',
  });

  const [pickupForm, setPickupForm] = useState({
    childId: '',
    pickUpPerson: '',
    relation: '',
    verificationMethod: 'face' as 'face' | 'card' | 'manual',
  });

  const stats = useMemo(() => ({
    total: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  }), [alerts]);

  const filteredAlerts = useMemo(() => alerts.filter(alert => {
    const matchesStatus = alertStatus === 'all' || alert.status === alertStatus;
    const matchesSearch = alert.title.includes(searchText) || alert.description.includes(searchText);
    return matchesStatus && matchesSearch;
  }), [alerts, alertStatus, searchText]);

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

  const groupedAuthorizedPersons = useMemo(() => {
    const grouped: Record<string, typeof authorizedPersons> = {};
    children.forEach(child => {
      grouped[child.id] = authorizedPersons.filter(p => p.childId === child.id);
    });
    return grouped;
  }, [authorizedPersons, children]);

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

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    updateAlert(alertId, { status: 'acknowledged', handler: '值班保安' });
    showSuccess('告警已确认');
  };

  const handleResolveAlert = (alertId: string) => {
    updateAlert(alertId, { status: 'resolved', handler: '值班保安' });
    showSuccess('告警已解决');
  };

  const handleToggleAlarm = () => {
    setAlarmPlaying(!alarmPlaying);
    if (!alarmPlaying) {
      showSuccess('声光报警已启动');
      setTimeout(() => setAlarmPlaying(false), 5000);
    }
  };

  const handleAddPerson = () => {
    if (!selectedChildId || !newPersonForm.name || !newPersonForm.relation || !newPersonForm.phone) {
      alert('请填写完整信息');
      return;
    }
    const child = children.find(c => c.id === selectedChildId);
    if (!child) return;

    addAuthorizedPerson({
      childId: selectedChildId,
      childName: child.name,
      name: newPersonForm.name,
      relation: newPersonForm.relation,
      phone: newPersonForm.phone,
      idCard: newPersonForm.idCard,
      isAuthorized: true,
      createdDate: new Date().toISOString().split('T')[0],
    });

    setNewPersonForm({ name: '', relation: '', phone: '', idCard: '' });
    setAddPersonModalOpen(false);
    showSuccess(`已成功添加 ${newPersonForm.relation} ${newPersonForm.name} 为授权接送人`);
  };

  const handleToggleAuthorization = (personId: string, currentStatus: boolean) => {
    updateAuthorizedPerson(personId, { isAuthorized: !currentStatus });
    showSuccess(currentStatus ? '已取消授权' : '已恢复授权');
  };

  const handleDeletePerson = (personId: string, personName: string) => {
    if (confirm(`确定要删除授权接送人 ${personName} 吗？`)) {
      deleteAuthorizedPerson(personId);
      showSuccess('已删除授权接送人');
    }
  };

  const handleSimulatePickup = () => {
    if (!pickupForm.childId || !pickupForm.pickUpPerson) {
      alert('请选择幼儿并填写接送人信息');
      return;
    }

    const child = children.find(c => c.id === pickupForm.childId);
    if (!child) return;

    const isAuthorized = authorizedPersons.some(
      p => p.childId === pickupForm.childId && 
           p.name === pickupForm.pickUpPerson && 
           p.isAuthorized
    );

    const now = new Date();
    const pickupRecord: PickupRecord = {
      id: `pickup${Date.now()}`,
      childId: pickupForm.childId,
      childName: child.name,
      className: child.className,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      pickUpPerson: pickupForm.pickUpPerson,
      relation: pickupForm.relation,
      verificationMethod: pickupForm.verificationMethod,
      authorized: isAuthorized,
    };

    addPickupRecord(pickupRecord);

    if (!isAuthorized) {
      const alert: Omit<SecurityAlert, 'id'> = {
        type: 'unauthorized_pickup',
        severity: 'high',
        title: '非授权人员接娃警报',
        description: `未授权人员「${pickupForm.pickUpPerson}」试图接走幼儿${child.name}，${pickupForm.verificationMethod === 'face' ? '人脸识别' : '刷卡'}验证未通过`,
        location: '幼儿园大门',
        timestamp: now.toISOString(),
        status: 'active',
      };
      addAlert(alert);
      setAlarmPlaying(true);
      setTimeout(() => setAlarmPlaying(false), 5000);
      showSuccess(`⚠️ 检测到未授权人员！已自动触发安全告警`);
    } else {
      showSuccess(`✅ ${pickupForm.relation}${pickupForm.pickUpPerson} 成功接走${child.name}`);
    }

    setPickupForm({ childId: '', pickUpPerson: '', relation: '', verificationMethod: 'face' });
    setPickupModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-4 flex items-center gap-3 animate-pulse">
          {successMessage.includes('⚠️') ? (
            <AlertTriangle className="text-danger-500" size={20} />
          ) : (
            <CheckCircle className="text-success-500" size={20} />
          )}
          <span className="text-sm font-medium text-gray-800">{successMessage}</span>
        </div>
      )}

      {alarmPlaying && (
        <div className="fixed inset-0 pointer-events-none z-40 border-8 border-danger-500 animate-pulse"></div>
      )}

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
            <button
              onClick={handleToggleAlarm}
              className={`flex items-center gap-1 ${alarmPlaying ? 'btn-danger' : 'btn-secondary'}`}
            >
              <Volume2 size={16} className={alarmPlaying ? 'animate-pulse' : ''} />
              {alarmPlaying ? '报警中...' : '告警声音'}
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
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CheckCircle size={48} className="mx-auto mb-3 opacity-30" />
                <p>暂无告警记录</p>
              </div>
            ) : (
              filteredAlerts.map(alert => (
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
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="btn-primary text-xs flex items-center gap-1"
                          >
                            <CheckCircle size={14} />
                            确认告警
                          </button>
                          <button className="btn-secondary text-xs flex items-center gap-1">
                            <Eye size={14} />
                            查看详情
                          </button>
                          <button
                            onClick={handleToggleAlarm}
                            className="btn-secondary text-xs flex items-center gap-1"
                          >
                            <Volume2 size={14} />
                            声光报警
                          </button>
                        </div>
                      )}
                      {alert.status === 'acknowledged' && (
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="btn-primary text-xs flex items-center gap-1"
                          >
                            <CheckCircle size={14} />
                            已解决
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
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
            <div className="bg-blue-50 rounded-lg p-4 mb-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Shield className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-blue-800">安全接送验证</p>
                  <p className="text-sm text-blue-600 mt-1">
                    所有接送人员需通过人脸识别或刷卡验证，非授权人员接送将触发告警并通知家长
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPickupModalOpen(true)}
                className="btn-primary flex items-center gap-1"
              >
                <UserPlus size={16} />
                模拟接送
              </button>
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
                  {pickupRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        <LogOut size={48} className="mx-auto mb-3 opacity-30" />
                        <p>暂无接送记录</p>
                      </td>
                    </tr>
                  ) : (
                    pickupRecords.map(record => (
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
                            {record.date} {record.time}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">{record.pickUpPerson}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{record.relation}</td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            {record.verificationMethod === 'face' ? <Camera size={14} /> : 
                             record.verificationMethod === 'card' ? <Shield size={14} /> : <User size={14} />}
                            {record.verificationMethod === 'face' ? '人脸识别' : 
                             record.verificationMethod === 'card' ? '刷卡' : '人工登记'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {record.authorized ? (
                            <span className="status-badge bg-success-100 text-success-600">已授权</span>
                          ) : (
                            <span className="status-badge bg-danger-100 text-danger-600">未授权 ⚠️</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'access' && (
          <div>
            <div className="bg-purple-50 rounded-lg p-4 mb-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Shield className="text-purple-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-purple-800">授权接送人管理</p>
                  <p className="text-sm text-purple-600 mt-1">
                    维护每位幼儿的授权接送人名单，只有授权人员才能接走幼儿
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="select-field w-40"
                >
                  <option value="">选择幼儿</option>
                  {children.map(child => (
                    <option key={child.id} value={child.id}>{child.name} - {child.className}</option>
                  ))}
                </select>
                <button
                  onClick={() => selectedChildId && setAddPersonModalOpen(true)}
                  disabled={!selectedChildId}
                  className={`flex items-center gap-1 ${selectedChildId ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}`}
                >
                  <Plus size={16} />
                  添加授权人
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {children.map(child => (
                <div key={child.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">{child.name[0]}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{child.name}</h4>
                      <p className="text-xs text-gray-500">{child.className} | {child.age}岁</p>
                    </div>
                    <span className="ml-auto text-xs text-gray-400">
                      已授权 {groupedAuthorizedPersons[child.id]?.length || 0} 人
                    </span>
                  </div>

                  {groupedAuthorizedPersons[child.id]?.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                      <User size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">暂无授权接送人</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {groupedAuthorizedPersons[child.id]?.map(person => (
                        <div
                          key={person.id}
                          className={`p-3 rounded-lg border ${
                            person.isAuthorized ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              person.isAuthorized ? 'bg-success-100' : 'bg-gray-100'
                            }`}>
                              <User className={person.isAuthorized ? 'text-success-600' : 'text-gray-400'} size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-800 truncate">{person.name}</p>
                                {person.isAuthorized ? (
                                  <span className="status-badge bg-success-100 text-success-600 text-xs">已授权</span>
                                ) : (
                                  <span className="status-badge bg-gray-100 text-gray-500 text-xs">已禁用</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">{person.relation} | {person.phone}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleToggleAuthorization(person.id, person.isAuthorized)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  person.isAuthorized
                                    ? 'text-warning-600 hover:bg-warning-50'
                                    : 'text-success-600 hover:bg-success-50'
                                }`}
                                title={person.isAuthorized ? '取消授权' : '恢复授权'}
                              >
                                {person.isAuthorized ? <PowerOff size={16} /> : <Power size={16} />}
                              </button>
                              <button
                                onClick={() => handleDeletePerson(person.id, person.name)}
                                className="p-1.5 text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                                title="删除"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={addPersonModalOpen}
        onClose={() => setAddPersonModalOpen(false)}
        title="添加授权接送人"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setAddPersonModalOpen(false)} className="btn-secondary">
              取消
            </button>
            <button onClick={handleAddPerson} className="btn-primary">
              确认添加
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">幼儿</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
              {children.find(c => c.id === selectedChildId)?.name} - {children.find(c => c.id === selectedChildId)?.className}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">接送人姓名 *</label>
            <input
              type="text"
              value={newPersonForm.name}
              onChange={(e) => setNewPersonForm({ ...newPersonForm, name: e.target.value })}
              className="input-field"
              placeholder="请输入接送人姓名"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">与幼儿关系 *</label>
            <select
              value={newPersonForm.relation}
              onChange={(e) => setNewPersonForm({ ...newPersonForm, relation: e.target.value })}
              className="select-field"
            >
              <option value="">请选择关系</option>
              <option value="父亲">父亲</option>
              <option value="母亲">母亲</option>
              <option value="祖父">祖父</option>
              <option value="祖母">祖母</option>
              <option value="外祖父">外祖父</option>
              <option value="外祖母">外祖母</option>
              <option value="其他亲属">其他亲属</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">联系电话 *</label>
            <input
              type="tel"
              value={newPersonForm.phone}
              onChange={(e) => setNewPersonForm({ ...newPersonForm, phone: e.target.value })}
              className="input-field"
              placeholder="请输入联系电话"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">身份证号（选填）</label>
            <input
              type="text"
              value={newPersonForm.idCard}
              onChange={(e) => setNewPersonForm({ ...newPersonForm, idCard: e.target.value })}
              className="input-field"
              placeholder="请输入身份证号用于核验"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={pickupModalOpen}
        onClose={() => setPickupModalOpen(false)}
        title="模拟接送登记"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setPickupModalOpen(false)} className="btn-secondary">
              取消
            </button>
            <button onClick={handleSimulatePickup} className="btn-primary">
              确认登记
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <Shield size={14} className="inline mr-1" />
              系统将自动校验接送人是否在授权名单中，未授权人员将触发安全告警
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">选择幼儿 *</label>
            <select
              value={pickupForm.childId}
              onChange={(e) => setPickupForm({ ...pickupForm, childId: e.target.value })}
              className="select-field"
            >
              <option value="">请选择幼儿</option>
              {children.map(child => (
                <option key={child.id} value={child.id}>{child.name} - {child.className}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">接送人姓名 *</label>
            <input
              type="text"
              value={pickupForm.pickUpPerson}
              onChange={(e) => setPickupForm({ ...pickupForm, pickUpPerson: e.target.value })}
              className="input-field"
              placeholder="请输入接送人姓名（如：张伟）"
            />
            {pickupForm.childId && pickupForm.pickUpPerson && (
              <p className={`text-xs mt-1 ${
                authorizedPersons.some(
                  p => p.childId === pickupForm.childId && 
                       p.name === pickupForm.pickUpPerson && 
                       p.isAuthorized
                ) ? 'text-success-600' : 'text-danger-600'
              }`}>
                {authorizedPersons.some(
                  p => p.childId === pickupForm.childId && 
                       p.name === pickupForm.pickUpPerson && 
                       p.isAuthorized
                ) ? '✓ 该人员在授权名单中' : '⚠️ 该人员不在授权名单中，登记将触发告警'}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">与幼儿关系</label>
            <input
              type="text"
              value={pickupForm.relation}
              onChange={(e) => setPickupForm({ ...pickupForm, relation: e.target.value })}
              className="input-field"
              placeholder="如：父亲"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">验证方式</label>
            <div className="flex gap-2">
              {[
                { value: 'face', label: '人脸识别', icon: <Camera size={16} /> },
                { value: 'card', label: '刷卡', icon: <Shield size={16} /> },
                { value: 'manual', label: '人工登记', icon: <User size={16} /> },
              ].map(method => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setPickupForm({ ...pickupForm, verificationMethod: method.value as any })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-colors ${
                    pickupForm.verificationMethod === method.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {method.icon}
                  <span className="text-sm">{method.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Security;
