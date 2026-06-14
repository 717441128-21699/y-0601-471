import React, { useMemo } from 'react';
import {
  Baby,
  Users,
  CalendarCheck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Package,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { attendanceRecords, activityZones, healthCheckRecords } from '../data/mockData';

const Dashboard: React.FC = () => {
  const { children, classes, alerts, bills, inventoryItems } = useApp();

  const totalChildren = children.length;
  const presentChildren = attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length;
  const attendanceRate = ((presentChildren / totalChildren) * 100).toFixed(1);
  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  const lowStockItems = inventoryItems.filter(i => i.status === 'low_stock' || i.status === 'out_of_stock').length;

  const weeklyAttendanceData = [
    { day: '周一', rate: 95.2, count: 58 },
    { day: '周二', rate: 96.7, count: 59 },
    { day: '周三', rate: 93.5, count: 57 },
    { day: '周四', rate: 98.4, count: 60 },
    { day: '周五', rate: 91.8, count: 56 },
    { day: '周六', rate: 45.0, count: 27 },
    { day: '周日', rate: 0, count: 0 },
  ];

  const classDistributionData = useMemo(() => classes.map(c => ({
    name: c.name,
    value: c.currentCount,
    capacity: c.capacity,
  })), [classes]);

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  const todayHealth = {
    normal: healthCheckRecords.filter(r => r.result === 'normal').length,
    needAttention: healthCheckRecords.filter(r => r.result === 'need_attention').length,
    abnormal: healthCheckRecords.filter(r => r.result === 'abnormal').length,
  };

  const financeSummary = useMemo(() => {
    const totalPaid = bills.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
    const totalUnpaid = bills.reduce((sum, b) => sum + (b.totalAmount - (b.paidAmount || 0)), 0);
    return { totalPaid, totalUnpaid };
  }, [bills]);

  const getZoneColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-green-100 border-green-300';
      case 'normal': return 'bg-blue-100 border-blue-300';
      case 'busy': return 'bg-yellow-100 border-yellow-400';
      case 'full': return 'bg-red-100 border-red-400';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getZoneTextColor = (status: string) => {
    switch (status) {
      case 'idle': return 'text-green-700';
      case 'normal': return 'text-blue-700';
      case 'busy': return 'text-yellow-700';
      case 'full': return 'text-red-700';
      default: return 'text-gray-700';
    }
  };

  const StatCard = ({ icon, title, value, change, changeType, iconBg }: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'up' | 'down';
    iconBg: string;
  }) => (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        {change && (
          <div className={`flex items-center gap-1 mt-1 text-xs ${
            changeType === 'up' ? 'text-success-600' : 'text-danger-500'
          }`}>
            {changeType === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-5">
        <StatCard
          icon={<Baby className="text-primary-500" size={24} />}
          title="在园幼儿"
          value={`${presentChildren}/${totalChildren}人`}
          change="较昨日 +2人"
          changeType="up"
          iconBg="bg-primary-50"
        />
        <StatCard
          icon={<CalendarCheck className="text-success-500" size={24} />}
          title="出勤率"
          value={`${attendanceRate}%`}
          change="较上周 +1.2%"
          changeType="up"
          iconBg="bg-success-50"
        />
        <StatCard
          icon={<AlertTriangle className="text-warning-500" size={24} />}
          title="安全告警"
          value={`${activeAlerts}个`}
          change="待处理"
          changeType="down"
          iconBg="bg-warning-50"
        />
        <StatCard
          icon={<Package className="text-purple-500" size={24} />}
          title="库存预警"
          value={`${lowStockItems}项`}
          change="需补货"
          changeType="down"
          iconBg="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">本周考勤趋势</h3>
            <select className="select-field w-32">
              <option>本周</option>
              <option>本月</option>
              <option>本学期</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} name="出勤率(%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">班级人数分布</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {classDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {classDistributionData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-800">{item.value}人</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">实时活动区热力</h3>
            <span className="text-xs text-gray-400">实时更新</span>
          </div>
          <div className="relative bg-gray-50 rounded-xl p-4 h-80">
            <div className="grid grid-cols-2 gap-3">
              {activityZones.slice(0, 6).map(zone => (
                <div
                  key={zone.id}
                  className={`p-3 rounded-lg border-2 ${getZoneColor(zone.status)} transition-all cursor-pointer hover:shadow-md`}
                  style={{ minHeight: '70px' }}
                >
                  <p className={`text-sm font-medium ${getZoneTextColor(zone.status)}`}>{zone.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{zone.currentCount}/{zone.capacity}人</p>
                  <div className="w-full bg-white/50 rounded-full h-1.5 mt-2">
                    <div
                      className={`h-1.5 rounded-full ${
                        zone.status === 'full' ? 'bg-red-500' :
                        zone.status === 'busy' ? 'bg-yellow-500' :
                        zone.status === 'normal' ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(zone.currentCount / zone.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">今日晨检情况</h3>
            <span className="text-xs text-gray-400">已检查 {healthCheckRecords.length} 人</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-success-50 rounded-lg">
              <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                <Activity className="text-success-500" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">健康正常</p>
                <p className="text-xl font-bold text-success-600">{todayHealth.normal}人</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-warning-50 rounded-lg">
              <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-warning-500" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">需关注</p>
                <p className="text-xl font-bold text-warning-600">{todayHealth.needAttention}人</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-danger-50 rounded-lg">
              <div className="w-10 h-10 bg-danger-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-danger-500" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">异常</p>
                <p className="text-xl font-bold text-danger-500">{todayHealth.abnormal}人</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">财务概览</h3>
            <span className="text-xs text-gray-400">本月</span>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
              <p className="text-sm text-gray-600">已收学费</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">¥{financeSummary.totalPaid.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-warning-50 to-warning-100 rounded-lg">
              <p className="text-sm text-gray-600">待收学费</p>
              <p className="text-2xl font-bold text-warning-600 mt-1">¥{financeSummary.totalUnpaid.toLocaleString()}</p>
            </div>
            <div className="pt-2">
              <button className="w-full btn-primary flex items-center justify-center gap-2">
                <DollarSign size={16} />
                查看详细账单
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">最近安全告警</h3>
            <button className="text-sm text-primary-500 hover:text-primary-600">查看全部</button>
          </div>
          <div className="space-y-3">
            {alerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  alert.severity === 'high' ? 'bg-danger-500' :
                  alert.severity === 'medium' ? 'bg-warning-500' : 'bg-primary-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800">{alert.title}</p>
                    <span className={`status-badge ${
                      alert.status === 'active' ? 'bg-danger-100 text-danger-600' :
                      alert.status === 'acknowledged' ? 'bg-warning-100 text-warning-600' :
                      'bg-success-100 text-success-600'
                    }`}>
                      {alert.status === 'active' ? '待处理' : alert.status === 'acknowledged' ? '处理中' : '已解决'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">{alert.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    <Clock size={12} className="inline mr-1" />
                    {new Date(alert.timestamp).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">库存预警</h3>
            <button className="text-sm text-primary-500 hover:text-primary-600">生成采购单</button>
          </div>
          <div className="space-y-3">
            {inventoryItems.filter(i => i.status === 'low_stock').map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                  <Package className="text-warning-500" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <span className="text-xs text-danger-500 font-medium">库存不足</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">当前: {item.quantity}{item.unit}</span>
                    <span className="text-xs text-gray-400">安全线: {item.minStock}{item.unit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-warning-500 h-1.5 rounded-full"
                      style={{ width: `${(item.quantity / item.minStock) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
