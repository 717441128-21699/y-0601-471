import React, { useState, useMemo } from 'react';
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
  X,
  Receipt,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import { FinancialBill } from '../types';

const Finance: React.FC = () => {
  const { bills, paymentRecords, updateBill, addPayment } = useApp();
  const [activeTab, setActiveTab] = useState('bills');
  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  const [searchText, setSearchText] = useState('');
  const [billStatus, setBillStatus] = useState('all');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<FinancialBill | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'wechat',
    remark: '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  const stats = useMemo(() => ({
    totalAmount: bills.reduce((sum, b) => sum + b.totalAmount, 0),
    paidAmount: bills.reduce((sum, b) => sum + b.paidAmount, 0),
    unpaidAmount: bills.reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0),
    overdueCount: bills.filter(b => b.status === 'overdue').length,
    paidCount: bills.filter(b => b.status === 'paid').length,
    partialCount: bills.filter(b => b.status === 'partial').length,
  }), [bills]);

  const filteredBills = useMemo(() => bills.filter(bill => {
    const matchesSearch = bill.childName.includes(searchText) || bill.className.includes(searchText);
    const matchesStatus = billStatus === 'all' || bill.status === billStatus;
    return matchesSearch && matchesStatus;
  }), [bills, searchText, billStatus]);

  const monthlyData = [
    { month: '1月', income: 85000, expense: 32000 },
    { month: '2月', income: 82000, expense: 35000 },
    { month: '3月', income: 88000, expense: 30000 },
    { month: '4月', income: 90000, expense: 38000 },
    { month: '5月', income: 87000, expense: 33000 },
    { month: '6月', income: stats.paidAmount, expense: 36000 },
  ];

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

  const handleOpenPayment = (bill: FinancialBill) => {
    setSelectedBill(bill);
    const remaining = bill.totalAmount - bill.paidAmount;
    setPaymentForm({
      amount: remaining.toString(),
      paymentMethod: 'wechat',
      remark: '',
    });
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = () => {
    if (!selectedBill) return;

    const amount = parseFloat(paymentForm.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('请输入有效的缴费金额');
      return;
    }

    const remaining = selectedBill.totalAmount - selectedBill.paidAmount;
    if (amount > remaining) {
      alert(`缴费金额不能超过待缴金额 ¥${remaining}`);
      return;
    }

    const newPaidAmount = selectedBill.paidAmount + amount;
    let newStatus: FinancialBill['status'] = selectedBill.status;
    
    if (newPaidAmount >= selectedBill.totalAmount) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'partial';
    }

    updateBill(selectedBill.id, {
      paidAmount: newPaidAmount,
      status: newStatus,
      paidDate: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : selectedBill.paidDate,
      paymentMethod: paymentForm.paymentMethod,
    });

    const paymentId = `pay${Date.now()}`;
    addPayment({
      id: paymentId,
      billId: selectedBill.id,
      childId: selectedBill.childId,
      childName: selectedBill.childName,
      className: selectedBill.className,
      amount: amount,
      paymentMethod: paymentForm.paymentMethod,
      paymentDate: new Date().toISOString().split('T')[0],
      remark: paymentForm.remark,
    });

    setPaymentModalOpen(false);
    setSuccessMessage(`缴费成功！已收取 ¥${amount.toLocaleString()}`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      wechat: '微信支付',
      alipay: '支付宝',
      bank: '银行转账',
      cash: '现金',
      card: '刷卡',
    };
    return methods[method] || method;
  };

  const getPaymentMethodIcon = (method: string) => {
    const colors: Record<string, string> = {
      wechat: 'text-green-500',
      alipay: 'text-blue-500',
      bank: 'text-purple-500',
      cash: 'text-orange-500',
      card: 'text-gray-500',
    };
    return <CreditCard size={14} className={colors[method] || 'text-gray-500'} />;
  };

  return (
    <div className="space-y-5">
      {successMessage && (
        <div className="fixed top-20 right-6 bg-success-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-bounce-slow">
          <CheckCircle size={18} />
          {successMessage}
        </div>
      )}

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
            { key: 'bills', label: '账单管理', count: filteredBills.length },
            { key: 'payment', label: '缴费记录', count: paymentRecords.length },
            { key: 'overdue', label: '欠费催缴', count: stats.overdueCount + bills.filter(b => b.status === 'unpaid').length },
            { key: 'statistics', label: '收支统计' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">待缴</th>
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
                    <td className="py-3 px-4 text-sm text-danger-600 font-medium">¥{bill.totalAmount - bill.paidAmount}</td>
                    <td className="py-3 px-4">{getStatusBadge(bill.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="text-xs text-primary-500 hover:text-primary-600">详情</button>
                        {(bill.status === 'unpaid' || bill.status === 'partial' || bill.status === 'overdue') && (
                          <button
                            onClick={() => handleOpenPayment(bill)}
                            className="text-xs text-success-500 hover:text-success-600 font-medium"
                          >
                            核销
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'payment' && (
          <div>
            {paymentRecords.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Receipt size={48} className="mx-auto mb-3 opacity-30" />
                <p>暂无缴费记录</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">缴费编号</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">幼儿姓名</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">班级</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">缴费金额</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">支付方式</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">缴费日期</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">备注</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentRecords.map(record => (
                      <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-mono text-gray-600">{record.id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">{record.childName[0]}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-800">{record.childName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{record.className}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-success-600">¥{record.amount.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1.5 text-sm text-gray-700">
                            {getPaymentMethodIcon(record.paymentMethod)}
                            {getPaymentMethodLabel(record.paymentMethod)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{record.paymentDate}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{record.remark || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                      当前有 {stats.overdueCount} 笔逾期账单，{bills.filter(b => b.status === 'unpaid').length} 笔未缴费账单，
                      共涉及 ¥{stats.unpaidAmount.toLocaleString()} 元
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
                <div key={bill.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
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
                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="text-gray-500">
                      应缴日期: <span className={`font-medium ${bill.status === 'overdue' ? 'text-danger-600' : 'text-gray-700'}`}>
                        {bill.dueDate} {bill.status === 'overdue' && '(已逾期)'}
                      </span>
                    </div>
                    {bill.remarks && (
                      <div className="text-gray-500">
                        备注: <span className="text-gray-700">{bill.remarks}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary text-xs flex items-center gap-1 flex-1">
                      <FileText size={14} />
                      账单详情
                    </button>
                    <button className="btn-secondary text-xs flex items-center gap-1 flex-1">
                      <Send size={14} />
                      发送催缴
                    </button>
                    <button
                      onClick={() => handleOpenPayment(bill)}
                      className="btn-primary text-xs flex items-center gap-1 flex-1"
                    >
                      <CreditCard size={14} />
                      立即缴费
                    </button>
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

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-white border border-gray-200 rounded-xl text-center">
                <p className="text-3xl font-bold text-success-600">{stats.paidCount}</p>
                <p className="text-sm text-gray-500 mt-1">已缴清</p>
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-xl text-center">
                <p className="text-3xl font-bold text-warning-600">{stats.partialCount}</p>
                <p className="text-sm text-gray-500 mt-1">部分缴费</p>
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-xl text-center">
                <p className="text-3xl font-bold text-danger-600">{stats.overdueCount + bills.filter(b => b.status === 'unpaid').length}</p>
                <p className="text-sm text-gray-500 mt-1">待缴费</p>
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
      </div>

      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="缴费核销"
        size="md"
        footer={
          <>
            <button onClick={() => setPaymentModalOpen(false)} className="btn-secondary">
              取消
            </button>
            <button onClick={handlePaymentSubmit} className="btn-primary flex items-center gap-1">
              <Check size={16} />
              确认缴费
            </button>
          </>
        }
      >
        {selectedBill && (
          <div className="space-y-5">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">{selectedBill.childName[0]}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{selectedBill.childName}</p>
                  <p className="text-sm text-gray-500">{selectedBill.className} · {selectedBill.month}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">应收总额</span>
                  <span className="font-medium text-gray-800">¥{selectedBill.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">已缴金额</span>
                  <span className="font-medium text-success-600">¥{selectedBill.paidAmount}</span>
                </div>
                <div className="col-span-2 flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-700 font-medium">本次待缴</span>
                  <span className="text-lg font-bold text-danger-600">¥{selectedBill.totalAmount - selectedBill.paidAmount}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                缴费金额 <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="input-field pl-8"
                  placeholder="请输入缴费金额"
                  max={selectedBill.totalAmount - selectedBill.paidAmount}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                最多可缴 ¥{selectedBill.totalAmount - selectedBill.paidAmount}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                支付方式 <span className="text-danger-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'wechat', label: '微信支付', color: 'border-green-500 bg-green-50 text-green-700' },
                  { key: 'alipay', label: '支付宝', color: 'border-blue-500 bg-blue-50 text-blue-700' },
                  { key: 'bank', label: '银行转账', color: 'border-purple-500 bg-purple-50 text-purple-700' },
                  { key: 'cash', label: '现金', color: 'border-orange-500 bg-orange-50 text-orange-700' },
                  { key: 'card', label: '刷卡', color: 'border-gray-500 bg-gray-50 text-gray-700' },
                ].map(method => (
                  <button
                    key={method.key}
                    type="button"
                    onClick={() => setPaymentForm(prev => ({ ...prev, paymentMethod: method.key }))}
                    className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      paymentForm.paymentMethod === method.key
                        ? method.color
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                备注
              </label>
              <textarea
                value={paymentForm.remark}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, remark: e.target.value }))}
                className="input-field min-h-[80px] resize-none"
                placeholder="可选：填写备注信息"
              />
            </div>
          </div>
        )}
      </Modal>

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
