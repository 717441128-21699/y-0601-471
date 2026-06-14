import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Settings,
  Calendar,
  FileText,
  Users,
  Package,
  ChevronRight,
} from 'lucide-react';
import { equipment, maintenanceWorkOrders } from '../data/mockData';

const Maintenance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('equipment');
  const [searchText, setSearchText] = useState('');
  const [equipmentType, setEquipmentType] = useState('all');
  const [orderStatus, setOrderStatus] = useState('all');

  const stats = {
    total: equipment.length,
    normal: equipment.filter(e => e.status === 'normal').length,
    warning: equipment.filter(e => e.status === 'warning').length,
    fault: equipment.filter(e => e.status === 'fault').length,
    pendingOrders: maintenanceWorkOrders.filter(o => o.status === 'pending').length,
    inProgressOrders: maintenanceWorkOrders.filter(o => o.status === 'in_progress').length,
  };

  const filteredEquipment = equipment.filter(e => {
    const matchesSearch = e.name.includes(searchText) || e.type.includes(searchText);
    const matchesType = equipmentType === 'all' || e.type === equipmentType;
    return matchesSearch && matchesType;
  });

  const filteredOrders = maintenanceWorkOrders.filter(o => {
    return orderStatus === 'all' || o.status === orderStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      normal: 'bg-success-100 text-success-600',
      warning: 'bg-warning-100 text-warning-600',
      fault: 'bg-danger-100 text-danger-600',
      maintenance: 'bg-blue-100 text-blue-600',
    };
    const labels: Record<string, string> = {
      normal: '运行正常',
      warning: '预警',
      fault: '故障',
      maintenance: '维护中',
    };
    return <span className={`status-badge ${styles[status]}`}>{labels[status]}</span>;
  };

  const getOrderStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-warning-100 text-warning-600',
      in_progress: 'bg-blue-100 text-blue-600',
      completed: 'bg-success-100 text-success-600',
      cancelled: 'bg-gray-100 text-gray-600',
    };
    const labels: Record<string, string> = {
      pending: '待处理',
      in_progress: '处理中',
      completed: '已完成',
      cancelled: '已取消',
    };
    return <span className={`status-badge ${styles[status]}`}>{labels[status]}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      urgent: 'bg-red-100 text-red-600',
      high: 'bg-orange-100 text-orange-600',
      medium: 'bg-yellow-100 text-yellow-600',
      low: 'bg-green-100 text-green-600',
    };
    const labels: Record<string, string> = {
      urgent: '紧急',
      high: '高',
      medium: '中',
      low: '低',
    };
    return <span className={`status-badge ${styles[priority]}`}>{labels[priority]}</span>;
  };

  const getOrderTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      routine: '例行维护',
      fault: '故障维修',
      inspection: '巡检',
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-5 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Settings className="text-blue-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">设备总数</p>
              <p className="text-xl font-bold text-gray-800">{stats.total}台</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-success-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">正常运行</p>
              <p className="text-xl font-bold text-success-600">{stats.normal}台</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-warning-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">预警</p>
              <p className="text-xl font-bold text-warning-600">{stats.warning}台</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center">
              <Wrench className="text-danger-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">待处理工单</p>
              <p className="text-xl font-bold text-danger-500">{stats.pendingOrders}单</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="text-purple-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">处理中</p>
              <p className="text-xl font-bold text-purple-600">{stats.inProgressOrders}单</p>
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
                placeholder="搜索设备..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9 pr-4 py-2 w-56 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value)}
              className="select-field w-32"
            >
              <option value="all">全部类型</option>
              <option value="空调">空调</option>
              <option value="安防设备">安防设备</option>
              <option value="校车">校车</option>
              <option value="卫生设备">卫生设备</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary flex items-center gap-1">
              <FileText size={16} />
              导出报表
            </button>
            <button className="btn-primary flex items-center gap-1">
              <Plus size={16} />
              新增工单
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 border-b border-gray-100">
          {[
            { key: 'equipment', label: '设备管理' },
            { key: 'workorders', label: '维保工单' },
            { key: 'spareparts', label: '备件管理' },
            { key: 'teams', label: '后勤班组' },
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

        {activeTab === 'equipment' && (
          <div>
            <div className="grid grid-cols-2 gap-4">
              {filteredEquipment.map(eq => (
                <div key={eq.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        eq.status === 'normal' ? 'bg-green-100' :
                        eq.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <Settings className={
                          eq.status === 'normal' ? 'text-green-600' :
                          eq.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                        } size={24} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{eq.name}</p>
                        <p className="text-xs text-gray-500">{eq.type} · {eq.model}</p>
                      </div>
                    </div>
                    {getStatusBadge(eq.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">安装位置</p>
                      <p className="text-gray-700">{eq.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">运行时长</p>
                      <p className="text-gray-700">{eq.runHours} 小时</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">上次维护</p>
                      <p className="text-gray-700">{eq.lastMaintenanceDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">下次维护</p>
                      <p className={`font-medium ${
                        new Date(eq.nextMaintenanceDate) <= new Date() ? 'text-red-500' : 'text-gray-700'
                      }`}>
                        {eq.nextMaintenanceDate}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">维护周期: {eq.maintenanceCycle}小时</span>
                      <button className="text-primary-500 hover:text-primary-600 flex items-center gap-1">
                        详情 <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  {eq.spareParts.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">备件库存</p>
                      <div className="space-y-1">
                        {eq.spareParts.map(part => (
                          <div key={part.id} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{part.name}</span>
                            <span className={part.quantity <= part.minStock ? 'text-red-500' : 'text-green-600'}>
                              {part.quantity}{part.unit} {part.quantity <= part.minStock && '(预警)'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'workorders' && (
          <div>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setOrderStatus('all')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  orderStatus === 'all' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setOrderStatus('pending')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  orderStatus === 'pending' ? 'bg-warning-50 text-warning-600' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                待处理
              </button>
              <button
                onClick={() => setOrderStatus('in_progress')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  orderStatus === 'in_progress' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                处理中
              </button>
              <button
                onClick={() => setOrderStatus('completed')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  orderStatus === 'completed' ? 'bg-success-50 text-success-600' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                已完成
              </button>
            </div>

            <div className="space-y-3">
              {filteredOrders.map(order => (
                <div key={order.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        order.type === 'fault' ? 'bg-red-100' :
                        order.type === 'routine' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        <Wrench className={
                          order.type === 'fault' ? 'text-red-600' :
                          order.type === 'routine' ? 'text-blue-600' : 'text-green-600'
                        } size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{order.equipmentName}</p>
                        <p className="text-xs text-gray-500">
                          {getOrderTypeLabel(order.type)} · 创建于 {order.createTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(order.priority)}
                      {getOrderStatusBadge(order.status)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{order.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">负责班组: {order.assignedTeam}</span>
                      {order.assignee && (
                        <span className="text-gray-500">处理人: {order.assignee}</span>
                      )}
                    </div>
                    {order.endTime ? (
                      <span className="text-gray-500">完成时间: {order.endTime}</span>
                    ) : order.startTime ? (
                      <span className="text-blue-500">开始时间: {order.startTime}</span>
                    ) : (
                      <span className="text-gray-400">待接单</span>
                    )}
                  </div>
                  {order.status === 'pending' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button className="btn-primary text-xs flex-1">派工</button>
                      <button className="btn-secondary text-xs flex-1">查看详情</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'spareparts' && (
          <div>
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-warning-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-warning-800">备件预警</p>
                  <p className="text-sm text-warning-600 mt-1">
                    共有 2 种备件库存低于预警阈值，需要及时补充
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { name: '过滤网', type: '空调配件', total: 8, minStock: 5, unit: '个', status: 'normal' },
                { name: '制冷剂', type: '空调配件', total: 2, minStock: 2, unit: '瓶', status: 'warning' },
                { name: '硬盘', type: '监控配件', total: 1, minStock: 2, unit: '块', status: 'low' },
                { name: '紫外灯管', type: '消毒设备', total: 4, minStock: 3, unit: '支', status: 'normal' },
                { name: '机油滤芯', type: '校车配件', total: 3, minStock: 2, unit: '个', status: 'normal' },
                { name: '空气滤芯', type: '校车配件', total: 2, minStock: 1, unit: '个', status: 'normal' },
              ].map((part, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="text-gray-500" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{part.name}</p>
                        <p className="text-xs text-gray-500">{part.type}</p>
                      </div>
                    </div>
                    <span className={`status-badge ${
                      part.status === 'normal' ? 'bg-success-100 text-success-600' :
                      part.status === 'warning' ? 'bg-warning-100 text-warning-600' :
                      'bg-danger-100 text-danger-600'
                    }`}>
                      {part.status === 'normal' ? '充足' : part.status === 'warning' ? '预警' : '不足'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">当前库存</span>
                    <span className="font-medium text-gray-800">{part.total} {part.unit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className={`h-1.5 rounded-full ${
                        part.status === 'normal' ? 'bg-success-500' :
                        part.status === 'warning' ? 'bg-warning-500' : 'bg-danger-500'
                      }`}
                      style={{ width: `${Math.min((part.total / (part.minStock * 2)) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">预警值: {part.minStock} {part.unit}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="text-center py-12 text-gray-400">
            <Users size={48} className="mx-auto mb-3 opacity-30" />
            <p>后勤班组管理功能开发中...</p>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">自动维保规则</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-blue-500" size={18} />
              <span className="font-medium text-blue-800">按运行时长</span>
            </div>
            <p className="text-sm text-blue-600">
              设备累计运行达到维护周期自动生成维保工单，分配对应班组处理
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-green-500" size={18} />
              <span className="font-medium text-green-800">故障自动报警</span>
            </div>
            <p className="text-sm text-green-600">
              设备运行异常自动触发故障工单，推送通知给相关负责人
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package className="text-purple-500" size={18} />
              <span className="font-medium text-purple-800">备件自动预警</span>
            </div>
            <p className="text-sm text-purple-600">
              备件库存低于阈值自动提醒，关联采购流程及时补货
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
