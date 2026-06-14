import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  FileText,
  Search,
  Filter,
  Download,
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { financialBills, children, classes } from '../data/mockData';

const Finance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('bills');
  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  const [searchText, setSearchText] = useState('');
  const [billStatus, setBillStatus] = useState('all');

  const stats = {
    totalAmount: financialBills.reduce((sum, b) => sum + b.totalAmount, 0),
    paidAmount: financialBills.reduce((sum, b) => sum + b.paidAmount, 0),
    unpaidAmount: financialBills.reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0),
    overdueCount: financialBills.filter(b => b.status === 'overdue').length,
    paidCount: financialBills.filter(b => b.status === 'paid').length,
  };

  const filteredBills = financialBills.filter(bill => {
    const matchesSearch = bill.childName.includes(searchText) || bill.className.includes(searchText);
    const matchesStatus = billStatus === 'all' || bill.status === billStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-success-100 text-success-600',
      partial: 'bg-warning-100 text-warning-600',
      unpaid: 'bg-gray-100 text-gray-600',
      overdue: 'bg-danger-100 text-danger-600',
    };
    const labels: Record<string, string> = {
      paid: '已缴清',
      partial: '部分缴费',
      unpaid: '未缴费',
      overdue: '已逾期',
    };
    return <span className={`status-badge ${styles[status]}`}>{labels[status]}</span>;
  };

  const monthlyData = [
    { month: '1月', income: 85000, expense: 32000 },
    { month: '2月', income: 82000, expense: 35000 },
    { month: '3月', income: 88000, expense: 30000 },
    { month: '4月', income: 90000, expense: 38000 },
    { month: '5月', income: 87000, expense: 33000 },
    { month: '6月', income: stats.paidAmount, expense: 36000 },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-primary-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">本月应收</p>
              <p className="text-xl font-bold text-gray-800">¥{stats.totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-success-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">已收金额</p>
              <p className="text-xl font-bold text-success-600">¥{stats.paidAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <Clock className="text-warning-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">待收金额</p>
              <p className="text-xl font-bold text-warning-600">¥{stats.unpaidAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-danger-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">逾期账单</p>
              <p className="text-xl font-bold text-danger-500">{stats.overdueCount}笔</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="input-field w-40"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="搜索幼儿/班级..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9 pr-4 py-2 w-56 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={billStatus}
              onChange={(e) => setBillStatus(e.target.value)}
              className="select-field w-32"
            >
              <option value="all">全部状态</option>
              <option value="paid">已缴清</option>
              <option value="partial">部分缴费</option>
              <option value="unpaid">未缴费</option>
              <option value="overdue">已逾期</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary flex items-center gap-1">
              <Download size={16} />
              导出账单
            </button>
            <button className="btn-primary flex items-center gap-1">
              <Plus size={16} />
              生成账单
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 border-b border-gray-100">
          {[
            { key: 'bills', label: '账单管理' },
            { key: 'payment', label: '缴费记录' },
            { key: 'overdue', label: '欠费催缴' },
            { key: 'statistics', label: '收支统计' },
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

        {activeTab === 'bills' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">幼儿信息</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">班级</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">保教费</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">伙食费</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">其他费用</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">总金额</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">已缴金额</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map(bill => (
                  <tr key={bill.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">{bill.childName[0]}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-800">{bill.childName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{bill.className}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">¥{bill.tuitionFee}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">¥{bill.mealFee}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">¥{bill.otherFee}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-800">¥{bill.totalAmount}</td>
                    <td className="py-3 px-4 text-sm text-success-600">¥{bill.paidAmount}</td>
                    <td className="py-3 px-4">{getStatusBadge(bill.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="text-xs text-primary-500 hover:text-primary-600">详情</button>
                        {(bill.status === 'unpaid' || bill.status === 'partial') && (
                          <button className="text-xs text-success-500 hover:text-success-600">核销</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'overdue' && (
          <div>
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-danger-500 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-danger-800">欠费催缴提醒</p>
                    <p className="text-sm text-danger-600 mt-1">
                      当前有 {stats.overdueCount} 笔逾期账单，共涉及 ¥{stats.unpaidAmount.toLocaleString()} 元
                    </p>
                  </div>
                </div>
                <button className="btn-danger flex items-center gap-1">
                  <Send size={16} />
                  批量催缴
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredBills.filter(b => b.status === 'overdue' || b.status === 'unpaid').map(bill => (
                <div key={bill.id} className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{bill.childName[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{bill.childName}</p>
                        <p className="text-xs text-gray-500">{bill.className} · {bill.month}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-danger-600">¥{bill.totalAmount - bill.paidAmount}</p>
                      <p className="text-xs text-gray-400">待缴金额</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-500">
                      应缴日期: <span className="text-gray-700">{bill.dueDate}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-secondary text-xs flex items-center gap-1">
                        <FileText size={14} />
                        账单详情
                      </button>
                      <button className="btn-primary text-xs flex items-center gap-1">
                        <Send size={14} />
                        发送催缴
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-green-600">本月收入</p>
                    <p className="text-2xl font-bold text-green-700">¥{stats.paidAmount.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-xs text-green-600">较上月增长 8.5%</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center">
                    <TrendingDown className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-orange-600">本月支出</p>
                    <p className="text-2xl font-bold text-orange-700">¥36,000</p>
                  </div>
                </div>
                <p className="text-xs text-orange-600">较上月下降 2.3%</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-5">
              <h4 className="font-medium text-gray-800 mb-4">近6个月收支趋势</h4>
              <div className="space-y-4">
                {monthlyData.map(data => (
                  <div key={data.month} className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 w-12">{data.month}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-green-600">收入</span>
                            <span className="text-gray-600">¥{(data.income / 1000).toFixed(0)}k</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(data.income / 100000) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-orange-600">支出</span>
                            <span className="text-gray-600">¥{(data.expense / 1000).toFixed(0)}k</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full"
                              style={{ width: `${(data.expense / 50000) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="text-center py-12 text-gray-400">
            <CreditCard size={48} className="mx-auto mb-3 opacity-30" />
            <p>缴费记录功能开发中...</p>
          </div>
        )}
      </div>

      {activeTab === 'bills' && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">费用构成说明</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">保教费</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">¥1,000-1,200</p>
              <p className="text-xs text-blue-500 mt-1">按月收取，不同班级不同标准</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800">伙食费</p>
              <p className="text-2xl font-bold text-green-600 mt-2">¥450-500</p>
              <p className="text-xs text-green-500 mt-1">含三餐两点，按实际出勤结算</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-800">其他费用</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">¥0-100</p>
              <p className="text-xs text-purple-500 mt-1">含材料费、活动费等</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm font-medium text-orange-800">优惠政策</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">最多10%</p>
              <p className="text-xs text-orange-500 mt-1">老学员、多子女家庭可享优惠</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
