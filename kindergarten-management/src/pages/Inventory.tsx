import React, { useState } from 'react';
import {
  Search,
  Package,
  ShoppingCart,
  AlertTriangle,
  Plus,
  Filter,
  Download,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { inventoryItems, purchaseOrders } from '../data/mockData';

const Inventory: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('inventory');

  const categories = ['all', '主食', '肉类', '蛋类', '乳制品', '蔬菜', '水果'];

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.includes(searchText);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: inventoryItems.length,
    lowStock: inventoryItems.filter(i => i.status === 'low_stock').length,
    outOfStock: inventoryItems.filter(i => i.status === 'out_of_stock').length,
    totalValue: inventoryItems.reduce((sum, i) => sum + i.quantity * 5, 0),
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      normal: 'bg-success-100 text-success-600',
      low_stock: 'bg-warning-100 text-warning-600',
      out_of_stock: 'bg-danger-100 text-danger-600',
      expiring: 'bg-orange-100 text-orange-600',
    };
    const labels: Record<string, string> = {
      normal: '正常',
      low_stock: '库存不足',
      out_of_stock: '缺货',
      expiring: '即将过期',
    };
    return <span className={`status-badge ${styles[status]}`}>{labels[status]}</span>;
  };

  const getPurchaseStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-warning-100 text-warning-600',
      approved: 'bg-primary-100 text-primary-600',
      ordered: 'bg-blue-100 text-blue-600',
      received: 'bg-success-100 text-success-600',
      cancelled: 'bg-gray-100 text-gray-600',
    };
    const labels: Record<string, string> = {
      pending: '待审批',
      approved: '已批准',
      ordered: '已下单',
      received: '已入库',
      cancelled: '已取消',
    };
    return <span className={`status-badge ${styles[status]}`}>{labels[status]}</span>;
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="text-blue-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">库存品类</p>
              <p className="text-xl font-bold text-gray-800">{stats.total}种</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-warning-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">库存预警</p>
              <p className="text-xl font-bold text-warning-600">{stats.lowStock}种</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center">
              <XCircle className="text-danger-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">缺货</p>
              <p className="text-xl font-bold text-danger-500">{stats.outOfStock}种</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="text-green-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">采购订单</p>
              <p className="text-xl font-bold text-gray-800">{purchaseOrders.length}单</p>
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
                placeholder="搜索食材..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9 pr-4 py-2 w-56 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="select-field w-32"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'all' ? '全部分类' : c}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="select-field w-32"
            >
              <option value="all">全部状态</option>
              <option value="normal">正常</option>
              <option value="low_stock">库存不足</option>
              <option value="out_of_stock">缺货</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary flex items-center gap-1">
              <Download size={16} />
              导出
            </button>
            <button className="btn-primary flex items-center gap-1">
              <Plus size={16} />
              入库登记
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 border-b border-gray-100">
          {[
            { key: 'inventory', label: '库存清单' },
            { key: 'purchase', label: '采购订单' },
            { key: 'supplier', label: '供应商管理' },
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

        {activeTab === 'inventory' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">食材名称</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">分类</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">当前库存</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">安全库存</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">库存状态</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">最近补货</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">供应商</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="text-gray-500" size={16} />
                        </div>
                        <span className="text-sm font-medium text-gray-800">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{item.category}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.quantity} {item.unit}</p>
                        <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              item.quantity >= item.maxStock ? 'bg-success-500' :
                              item.quantity >= item.minStock ? 'bg-primary-500' : 'bg-warning-500'
                            }`}
                            style={{ width: `${Math.min((item.quantity / item.maxStock) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{item.minStock} {item.unit}</td>
                    <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{item.lastRestockDate}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{item.supplier}</td>
                    <td className="py-3 px-4">
                      <button className="text-sm text-primary-500 hover:text-primary-600">补货</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'purchase' && (
          <div>
            <div className="flex justify-end mb-4">
              <button className="btn-primary flex items-center gap-1">
                <Plus size={16} />
                新建采购单
              </button>
            </div>
            <div className="space-y-3">
              {purchaseOrders.map(order => (
                <div key={order.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="text-blue-500" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">采购单 #{order.id}</p>
                        <p className="text-xs text-gray-500">
                          <Clock size={10} className="inline mr-1" />
                          {order.orderDate} · {order.supplier}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-bold text-primary-600">¥{order.totalAmount}</p>
                      {getPurchaseStatusBadge(order.status)}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {item.name} × {item.quantity}{item.unit}
                      </span>
                    ))}
                  </div>
                  {order.approver && (
                    <p className="text-xs text-gray-400">审批人: {order.approver}</p>
                  )}
                  {order.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button className="btn-success text-xs flex-1">批准</button>
                      <button className="btn-danger text-xs flex-1">拒绝</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'supplier' && (
          <div className="grid grid-cols-3 gap-4">
            {['粮油批发公司', '鲜肉配送中心', '蛋品供应商', '乳制品公司', '蔬菜基地', '水果批发商'].map((supplier, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-300 to-primary-500 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="text-white" size={22} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{supplier}</p>
                    <p className="text-xs text-gray-500">合作供应商</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">联系人</span>
                    <span className="text-gray-700">张经理</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">联系电话</span>
                    <span className="text-gray-700">138{1000 + idx}1234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">配送频率</span>
                    <span className="text-gray-700">{idx % 2 === 0 ? '每日' : '隔日'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeTab === 'inventory' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">智能补货建议</h3>
            <button className="btn-primary text-sm">一键生成采购单</button>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-700">
              系统根据库存水平、消耗速度和安全库存自动计算补货建议，共有 {stats.lowStock} 项物资需要补货
            </p>
          </div>
          <div className="space-y-2">
            {inventoryItems.filter(i => i.status === 'low_stock').map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-warning-500" size={18} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      当前库存: {item.quantity}{item.unit} · 安全库存: {item.minStock}{item.unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">建议补货量</p>
                    <p className="text-sm font-medium text-gray-800">
                      {Math.ceil(item.maxStock * 0.6)}{item.unit}
                    </p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-primary-500" />
                    <span className="text-sm text-gray-600">选中</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
