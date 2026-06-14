import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  DollarSign,
  Package,
  ShoppingCart,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  ChevronRight,
  Clock,
  Baby,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  FinancialBill,
  InventoryItem,
  PurchaseOrder,
  SecurityAlert,
  ShiftSwapRequest,
} from '../types';

type TodoCategory = 'all' | 'finance' | 'inventory' | 'purchase' | 'security' | 'schedule';

interface TodoItem {
  id: string;
  category: Exclude<TodoCategory, 'all'>;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  navigatePath: string;
  rawData: FinancialBill | InventoryItem | PurchaseOrder | SecurityAlert | ShiftSwapRequest;
}

const TodoCenter: React.FC = () => {
  const navigate = useNavigate();
  const { bills, inventoryItems, purchaseOrders, alerts, swapRequests, children } = useApp();
  const [activeCategory, setActiveCategory] = useState<TodoCategory>('all');

  const todoItems = useMemo<TodoItem[]>(() => {
    const items: TodoItem[] = [];

    bills.forEach(bill => {
      if (bill.status !== 'paid') {
        const remaining = bill.totalAmount - (bill.paidAmount || 0);
        items.push({
          id: `bill-${bill.id}`,
          category: 'finance',
          title: `${bill.childName} - ${bill.month}月保教费待缴费`,
          description: bill.status === 'partial'
            ? `已缴 ¥${bill.paidAmount}，待缴 ¥${remaining.toFixed(2)}`
            : `应缴 ¥${bill.totalAmount.toFixed(2)}，尚未缴费`,
          priority: remaining > 2000 ? 'high' : remaining > 500 ? 'medium' : 'low',
          createdAt: bill.dueDate,
          navigatePath: '/finance',
          rawData: bill,
        });
      }
    });

    inventoryItems.forEach(item => {
      if (item.status === 'low_stock' || item.status === 'out_of_stock') {
        items.push({
          id: `inv-${item.id}`,
          category: 'inventory',
          title: `${item.name} 库存${item.status === 'out_of_stock' ? '缺货' : '不足'}`,
          description: `当前 ${item.quantity}${item.unit}，安全线 ${item.minStock}${item.unit}`,
          priority: item.status === 'out_of_stock' ? 'high' : 'medium',
          createdAt: item.lastRestockDate,
          navigatePath: '/inventory',
          rawData: item,
        });
      }
    });

    purchaseOrders.forEach(order => {
      if (order.status === 'pending') {
        items.push({
          id: `po-${order.id}`,
          category: 'purchase',
          title: `采购单 ${order.id} 待审批`,
          description: `${order.items.length} 项食材，合计 ¥${order.totalAmount}`,
          priority: order.totalAmount > 2000 ? 'high' : 'medium',
          createdAt: order.orderDate,
          navigatePath: '/inventory',
          rawData: order,
        });
      }
    });

    alerts.forEach(alert => {
      if (alert.status === 'active' || alert.status === 'acknowledged') {
        items.push({
          id: `alert-${alert.id}`,
          category: 'security',
          title: alert.title,
          description: alert.description,
          priority: alert.severity === 'high' ? 'high' : alert.severity === 'medium' ? 'medium' : 'low',
          createdAt: alert.timestamp,
          navigatePath: '/security',
          rawData: alert,
        });
      }
    });

    swapRequests.forEach(request => {
      if (request.status === 'pending') {
        items.push({
          id: `swap-${request.id}`,
          category: 'schedule',
          title: `${request.requesterName} 的调班申请待审批`,
          description: `${request.originalShift.date} ${request.originalShift.startTime}-${request.originalShift.endTime}，代班: ${request.targetTeacherName || '待指定'}`,
          priority: 'medium',
          createdAt: request.createTime,
          navigatePath: '/schedule',
          rawData: request,
        });
      }
    });

    return items.sort((a, b) => {
      const priorityWeight = { high: 0, medium: 1, low: 2 };
      if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
        return priorityWeight[a.priority] - priorityWeight[b.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [bills, inventoryItems, purchaseOrders, alerts, swapRequests]);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return todoItems;
    return todoItems.filter(item => item.category === activeCategory);
  }, [todoItems, activeCategory]);

  const stats = useMemo(() => ({
    all: todoItems.length,
    finance: todoItems.filter(i => i.category === 'finance').length,
    inventory: todoItems.filter(i => i.category === 'inventory').length,
    purchase: todoItems.filter(i => i.category === 'purchase').length,
    security: todoItems.filter(i => i.category === 'security').length,
    schedule: todoItems.filter(i => i.category === 'schedule').length,
  }), [todoItems]);

  const categoryConfig: Record<Exclude<TodoCategory, 'all'>, { label: string; icon: React.ReactNode; color: string }> = {
    finance: { label: '待缴费', icon: <DollarSign size={16} />, color: 'text-warning-600 bg-warning-50' },
    inventory: { label: '库存不足', icon: <Package size={16} />, color: 'text-orange-600 bg-orange-50' },
    purchase: { label: '采购审批', icon: <ShoppingCart size={16} />, color: 'text-blue-600 bg-blue-50' },
    security: { label: '安全告警', icon: <AlertTriangle size={16} />, color: 'text-danger-600 bg-danger-50' },
    schedule: { label: '调班审批', icon: <RefreshCw size={16} />, color: 'text-purple-600 bg-purple-50' },
  };

  const getPriorityBadge = (priority: TodoItem['priority']) => {
    const config = {
      high: { label: '紧急', class: 'bg-danger-100 text-danger-600' },
      medium: { label: '一般', class: 'bg-warning-100 text-warning-600' },
      low: { label: '低', class: 'bg-gray-100 text-gray-600' },
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${config[priority].class}`}>
        {config[priority].label}
      </span>
    );
  };

  const handleNavigate = (item: TodoItem) => {
    navigate(item.navigatePath);
  };

  const StatCard = ({ icon, label, count, color }: { icon: React.ReactNode; label: string; count: number; color: string }) => (
    <button
      onClick={() => setActiveCategory(label === '全部' ? 'all' : (label === '待缴费' ? 'finance' : label === '库存不足' ? 'inventory' : label === '采购审批' ? 'purchase' : label === '安全告警' ? 'security' : 'schedule'))}
      className={`card p-4 text-left transition-all hover:shadow-md ${activeCategory === (label === '全部' ? 'all' : label === '待缴费' ? 'finance' : label === '库存不足' ? 'inventory' : label === '采购审批' ? 'purchase' : label === '安全告警' ? 'security' : 'schedule') ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-800">{count}</p>
        </div>
      </div>
    </button>
  );

  const totalChildren = children.length;
  const lowStockCount = inventoryItems.filter(i => i.status === 'low_stock' || i.status === 'out_of_stock').length;
  const unpaidAmount = bills.reduce((sum, b) => sum + (b.totalAmount - (b.paidAmount || 0)), 0);

  return (
    <div className="space-y-5">
      <div className="card p-5 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Bell size={24} />
              待办中心
            </h2>
            <p className="text-sm text-primary-100 mt-1">共 {todoItems.length} 条待办事项需要处理</p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{totalChildren}</p>
              <p className="text-xs text-primary-100">在园幼儿</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">¥{unpaidAmount.toFixed(0)}</p>
              <p className="text-xs text-primary-100">待收金额</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{lowStockCount}</p>
              <p className="text-xs text-primary-100">库存预警</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4">
        <StatCard icon={<Bell size={20} className="text-primary-600" />} label="全部" count={stats.all} color="bg-primary-50" />
        <StatCard icon={<DollarSign size={20} className="text-warning-600" />} label="待缴费" count={stats.finance} color="bg-warning-50" />
        <StatCard icon={<Package size={20} className="text-orange-600" />} label="库存不足" count={stats.inventory} color="bg-orange-50" />
        <StatCard icon={<ShoppingCart size={20} className="text-blue-600" />} label="采购审批" count={stats.purchase} color="bg-blue-50" />
        <StatCard icon={<AlertTriangle size={20} className="text-danger-600" />} label="安全告警" count={stats.security} color="bg-danger-50" />
        <StatCard icon={<RefreshCw size={20} className="text-purple-600" />} label="调班审批" count={stats.schedule} color="bg-purple-50" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">
            {activeCategory === 'all' ? '全部待办' : categoryConfig[activeCategory as Exclude<TodoCategory, 'all'>]?.label || '待办列表'}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CheckCircle size={14} className="text-success-500" />
            <span>处理完自动消失</span>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-success-500" size={32} />
            </div>
            <p className="text-gray-600 font-medium">太棒了！当前分类没有待办事项</p>
            <p className="text-sm text-gray-400 mt-1">所有业务都处理完毕啦</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map(item => {
              const cat = categoryConfig[item.category];
              return (
                <div
                  key={item.id}
                  onClick={() => handleNavigate(item)}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-all group"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${cat.color}`}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-800 truncate">{item.title}</p>
                      {getPriorityBadge(item.priority)}
                      <span className={`px-2 py-0.5 rounded text-xs ${cat.color}`}>
                        {cat.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-warning-50 rounded-lg flex items-center justify-center">
              <DollarSign className="text-warning-600" size={20} />
            </div>
            <div>
              <p className="font-medium text-gray-800">财务催收</p>
              <p className="text-xs text-gray-500">{stats.finance} 位家长待缴费</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/finance')}
            className="w-full btn-secondary text-sm"
          >
            去催缴
          </button>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <ShoppingCart className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="font-medium text-gray-800">采购补货</p>
              <p className="text-xs text-gray-500">{stats.inventory + stats.purchase} 项需处理</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/inventory')}
            className="w-full btn-secondary text-sm"
          >
            去补货
          </button>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <FileText className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="font-medium text-gray-800">月度运营报告</p>
              <p className="text-xs text-gray-500">查看完整统计数据</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/statistics')}
            className="w-full btn-secondary text-sm"
          >
            查看报告
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoCenter;
