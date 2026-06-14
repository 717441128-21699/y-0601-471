import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  FileText,
  Users,
  AlertTriangle,
  Smile,
  MapPin,
  Clock,
  Filter,
  Printer,
  ChevronDown,
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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import { children, classes, activityZones } from '../data/mockData';

const Statistics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [timeRange, setTimeRange] = useState('month');
  const [selectedClass, setSelectedClass] = useState('all');

  const monthlyAttendanceData = [
    { month: '1月', attendance: 94.5, lastYear: 92.3 },
    { month: '2月', attendance: 93.2, lastYear: 91.8 },
    { month: '3月', attendance: 95.8, lastYear: 93.5 },
    { month: '4月', attendance: 96.1, lastYear: 94.2 },
    { month: '5月', attendance: 94.8, lastYear: 93.0 },
    { month: '6月', attendance: 95.5, lastYear: 94.0 },
  ];

  const weeklyAttendanceData = [
    { day: '周一', count: 58, rate: 96.7 },
    { day: '周二', count: 57, rate: 95.0 },
    { day: '周三', count: 59, rate: 98.3 },
    { day: '周四', count: 56, rate: 93.3 },
    { day: '周五', count: 58, rate: 96.7 },
  ];

  const classStats = classes.map(cls => ({
    name: cls.name,
    attendance: (cls.currentCount / cls.capacity * 100).toFixed(1),
    accidents: Math.floor(Math.random() * 3),
    satisfaction: 90 + Math.floor(Math.random() * 10),
    count: cls.currentCount,
  }));

  const satisfactionData = [
    { subject: '教学质量', score: 92 },
    { subject: '饮食营养', score: 88 },
    { subject: '安全保障', score: 95 },
    { subject: '师资力量', score: 90 },
    { subject: '环境设施', score: 87 },
    { subject: '沟通服务', score: 93 },
  ];

  const accidentData = [
    { type: '磕碰擦伤', count: 12 },
    { type: '运动受伤', count: 5 },
    { type: '误食过敏', count: 2 },
    { type: '其他', count: 3 },
  ];

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const dailyAttendanceTrend = Array.from({ length: 30 }, (_, i) => ({
    date: `${i + 1}日`,
    attendance: 90 + Math.floor(Math.random() * 10),
  }));

  const getZoneColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-green-200';
      case 'normal': return 'bg-blue-200';
      case 'busy': return 'bg-yellow-300';
      case 'full': return 'bg-red-400';
      default: return 'bg-gray-200';
    }
  };

  const getZoneOpacity = (current: number, capacity: number) => {
    return 0.3 + (current / capacity) * 0.7;
  };

  const overallStats = {
    avgAttendance: 95.2,
    attendanceTrend: 1.5,
    totalAccidents: 22,
    accidentTrend: -3,
    avgSatisfaction: 91.5,
    satisfactionTrend: 2.1,
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">平均出勤率</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-gray-800">{overallStats.avgAttendance}%</span>
                <span className="text-xs text-success-600 flex items-center gap-0.5">
                  <TrendingUp size={12} />
                  +{overallStats.attendanceTrend}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Users className="text-primary-500" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">本月事故数</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-gray-800">{overallStats.totalAccidents}起</span>
                <span className="text-xs text-success-600 flex items-center gap-0.5">
                  <TrendingDown size={12} />
                  {overallStats.accidentTrend}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="text-warning-500" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">家长满意度</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-gray-800">{overallStats.avgSatisfaction}%</span>
                <span className="text-xs text-success-600 flex items-center gap-0.5">
                  <TrendingUp size={12} />
                  +{overallStats.satisfactionTrend}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Smile className="text-green-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">统计报表</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="select-field w-28"
              >
                <option value="week">本周</option>
                <option value="month">本月</option>
                <option value="quarter">本季度</option>
                <option value="year">本年度</option>
              </select>
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="select-field w-32"
            >
              <option value="all">全部班级</option>
              {classes.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <button className="btn-secondary flex items-center gap-1">
              <Filter size={16} />
              筛选
            </button>
            <button className="btn-primary flex items-center gap-1">
              <Download size={16} />
              导出PDF
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-100">
          {[
            { key: 'attendance', label: '出勤率统计' },
            { key: 'accident', label: '事故率统计' },
            { key: 'satisfaction', label: '家长满意度' },
            { key: 'heatmap', label: '区域热力图' },
            { key: 'report', label: '月度报告' },
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

        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-4">月度出勤率趋势</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyAttendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} domain={[85, 100]} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={2} name="本年度" dot={{ fill: '#3b82f6', r: 4 }} />
                    <Line type="monotone" dataKey="lastYear" stroke="#d1d5db" strokeWidth={2} strokeDasharray="5 5" name="去年同期" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-4">本周出勤情况</h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyAttendanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="出勤人数" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-4">各班级出勤率</h4>
                <div className="space-y-4">
                  {classStats.map(cls => (
                    <div key={cls.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{cls.name}</span>
                        <span className="text-sm font-medium text-gray-800">{cls.attendance}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            Number(cls.attendance) >= 95 ? 'bg-green-500' :
                            Number(cls.attendance) >= 85 ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${cls.attendance}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{cls.count}人</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accident' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-4">事故类型分布</h4>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={accidentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="count"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {accidentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-4">各班级事故数</h4>
                <div className="space-y-4">
                  {classStats.map((cls, idx) => (
                    <div key={cls.name} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-800">{cls.name}</span>
                        <span className="text-sm text-danger-600">{cls.accidents}起</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            cls.accidents === 0 ? 'bg-green-500' :
                            cls.accidents <= 2 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${cls.accidents * 33}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-blue-800">安全提示</p>
                  <ul className="text-sm text-blue-600 mt-1 space-y-1">
                    <li>• 本月磕碰擦伤事故较多，建议加强活动区防护</li>
                    <li>• 运动类活动需注意热身和保护措施</li>
                    <li>• 过敏体质幼儿需重点关注饮食安全</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'satisfaction' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-4">各维度满意度雷达图</h4>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={satisfactionData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                      <Radar
                        name="满意度"
                        dataKey="score"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-4">满意度详情</h4>
                <div className="space-y-3">
                  {satisfactionData.map((item, idx) => (
                    <div key={item.subject} className="flex items-center gap-4">
                      <span className="text-sm text-gray-700 w-20">{item.subject}</span>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full"
                            style={{
                              width: `${item.score}%`,
                              backgroundColor: COLORS[idx % COLORS.length],
                            }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-800 w-12 text-right">{item.score}分</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Smile className="text-green-500" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">综合满意度</p>
                      <p className="text-2xl font-bold text-green-600">{overallStats.avgSatisfaction}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'heatmap' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-4">实时活动区热力图</h4>
              <div className="relative bg-gray-100 rounded-xl p-6 h-96">
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="text-xs text-gray-500">忙闲程度:</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
                    <span className="text-xs text-gray-600">空闲</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-200 rounded-sm"></div>
                    <span className="text-xs text-gray-600">正常</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-300 rounded-sm"></div>
                    <span className="text-xs text-gray-600">繁忙</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
                    <span className="text-xs text-gray-600">满员</span>
                  </div>
                </div>

                <div className="relative w-full h-full">
                  {activityZones.map(zone => (
                    <div
                      key={zone.id}
                      className={`absolute rounded-xl border-2 border-white/50 shadow-md transition-all cursor-pointer hover:scale-105 ${getZoneColor(zone.status)}`}
                      style={{
                        left: `${zone.position.x / 6.5}%`,
                        top: `${zone.position.y / 4}%`,
                        width: `${zone.position.width / 6.5}%`,
                        height: `${zone.position.height / 4}%`,
                        opacity: getZoneOpacity(zone.currentCount, zone.capacity),
                      }}
                    >
                      <div className="p-2 h-full flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-800 bg-white/60 px-1.5 py-0.5 rounded inline-block">
                            {zone.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-700 bg-white/70 px-1.5 py-0.5 rounded">
                            {zone.currentCount}/{zone.capacity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-4">教师分布</h4>
              <div className="grid grid-cols-4 gap-4">
                {activityZones.filter(z => z.teachers.length > 0).map(zone => (
                  <div key={zone.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={14} className="text-primary-500" />
                      <span className="text-sm font-medium text-gray-800">{zone.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {zone.teachers.map((teacher, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                          {teacher}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'report' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">6月运营月度报告</h3>
                  <p className="text-primary-100 mt-1">2026年6月1日 - 2026年6月30日</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                    <Printer size={16} />
                    打印
                  </button>
                  <button className="px-4 py-2 bg-white text-primary-600 hover:bg-white/90 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                    <FileText size={16} />
                    导出PDF
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 border border-gray-200 rounded-xl">
                <p className="text-sm text-gray-500">本月在园幼儿</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{children.length}人</p>
                <p className="text-xs text-success-600 mt-1">较上月 +3人</p>
              </div>
              <div className="p-5 border border-gray-200 rounded-xl">
                <p className="text-sm text-gray-500">月平均出勤率</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">95.2%</p>
                <p className="text-xs text-success-600 mt-1">较上月 +1.5%</p>
              </div>
              <div className="p-5 border border-gray-200 rounded-xl">
                <p className="text-sm text-gray-500">家长满意度</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">91.5%</p>
                <p className="text-xs text-success-600 mt-1">较上月 +2.1%</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 border border-gray-200 rounded-xl">
                <h4 className="font-medium text-gray-800 mb-4">月度考勤趋势</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyAttendanceTrend}>
                      <defs>
                        <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
                      <YAxis stroke="#9ca3af" fontSize={10} domain={[80, 100]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="attendance" stroke="#3b82f6" fill="url(#colorAttendance)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-5 border border-gray-200 rounded-xl">
                <h4 className="font-medium text-gray-800 mb-4">各班级对比</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                      <YAxis stroke="#9ca3af" fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="attendance" fill="#3b82f6" radius={[4, 4, 0, 0]} name="出勤率%" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="p-5 border border-gray-200 rounded-xl">
              <h4 className="font-medium text-gray-800 mb-4">报告摘要</h4>
              <div className="grid grid-cols-2 gap-6 text-sm text-gray-600">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">运营亮点</h5>
                  <ul className="space-y-1">
                    <li>• 出勤率持续提升，本月达到95.2%</li>
                    <li>• 家长满意度较上月上升2.1个百分点</li>
                    <li>• 安全事故率下降3%，安全管理成效显著</li>
                    <li>• 新增3名幼儿入园，生源稳定增长</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">改进建议</h5>
                  <ul className="space-y-1">
                    <li>• 进一步丰富课后活动内容</li>
                    <li>• 加强与家长的沟通频次</li>
                    <li>• 优化饮食结构，增加菜品多样性</li>
                    <li>• 完善设施设备维护保养机制</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
