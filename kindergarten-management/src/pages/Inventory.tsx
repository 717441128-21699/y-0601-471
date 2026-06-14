import React, { useState, useMemo } from 'react';
import {
  Search,
  Package,
  ShoppingCart,
  AlertTriangle,
  Plus,
  Filter,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  TrendingDown,
  Check,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import { InventoryItem, PurchaseOrder, PurchaseItem } from '../types';

const Inventory: React.FC = () => {
  const { inventoryItems, purchaseOrders, addPurchaseOrder, updatePurchaseOrder, updateInventoryItem, updateInventoryItemsBatch } = useApp();

  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('inventory');
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedRestockItem, setSelectedRestockItem] = useState<InventoryItem | null>(null);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [selectedRestockItems, setSelectedRestockItems] = useState<Set<string>>(new Set());
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [approveAction, setApproveAction] = useState<'approve' | 'reject'>('approve');
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [selectedReceiveOrder, setSelectedReceiveOrder] = useState<PurchaseOrder | null>(null);
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, string>>({});

  const categories = ['all', '主食', '肉类', '蛋类', '乳制品', '蔬菜', '水果'];

  const filteredItems = useMemo(() => inventoryItems.filter((item: InventoryItem) => {
    const matchesSearch = item.name.includes(searchText);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  }), [inventoryItems, searchText, selectedCategory, selectedStatus]);

  const lowStockItems = useMemo(() => inventoryItems.filter((i: InventoryItem) => i.status === 'low_stock'), [inventoryItems]);

  const stats = useMemo(() => ({
    total: inventoryItems.length,
    lowStock: lowStockItems.length,
    outOfStock: inventoryItems.filter((i: InventoryItem) => i.status === 'out_of_stock').length,
    pendingOrders: purchaseOrders.filter(o => o.status === 'pending').length,
    totalValue: inventoryItems.reduce((sum: number, i: InventoryItem) => sum + i.quantity * 5, 0),
  }), [inventoryItems, lowStockItems, purchaseOrders]);

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

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getUnitPrice = (itemName: string): number => {
    const priceMap: Record<string, number> = {
      '大米': 5, '面粉': 4, '小米': 8, '猪肉': 28, '鸡蛋': 0.8,
      '牛奶': 8, '青菜': 4, '番茄': 5, '苹果': 10, '香蕉': 6,
    };
    return priceMap[itemName] || 10;
  };

  const calculateRestockQuantity = (item: InventoryItem): number => {
    return Math.ceil((item.maxStock - item.quantity) * 0.8);
  };

  const handleToggleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedRestockItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedRestockItems(newSelected);
  };

  const handleSelectAllLowStock = () => {
    if (selectedRestockItems.size === lowStockItems.length) {
      setSelectedRestockItems(new Set());
    } else {
      setSelectedRestockItems(new Set(lowStockItems.map((i: InventoryItem) => i.id)));
    }
  };

  const handleGeneratePurchaseOrder = () => {
    if (selectedRestockItems.size === 0) {
      alert('请至少选择一项需要补货的食材');
      return;
    }
    setConfirmModalOpen(true);
  };

  const handleConfirmGenerateOrder = () => {
    const itemsToRestock = inventoryItems.filter((i: InventoryItem) => selectedRestockItems.has(i.id));
    
    if (itemsToRestock.length === 0) return;

    const purchaseItems: PurchaseItem[] = itemsToRestock.map((item: InventoryItem) => {
      const quantity = calculateRestockQuantity(item);
      return {
        ingredientId: item.id,
        name: item.name,
        quantity,
        unit: item.unit,
        unitPrice: getUnitPrice(item.name),
      };
    });

    const totalAmount = purchaseItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const supplier = itemsToRestock[0].supplier;

    addPurchaseOrder({
      orderDate: new Date().toISOString().split('T')[0],
      items: purchaseItems,
      totalAmount,
      status: 'pending',
      supplier,
    });

    setConfirmModalOpen(false);
    setSelectedRestockItems(new Set());
    showSuccess(`✅ 已成功生成采购单，共 ${purchaseItems.length} 项食材，待审批`);
    setActiveTab('purchase');
  };

  const handleSingleRestock = (item: InventoryItem) => {
    setSelectedRestockItem(item);
    setRestockQuantity(String(calculateRestockQuantity(item)));
    setRestockModalOpen(true);
  };

  const handleConfirmSingleRestock = () => {
    if (!selectedRestockItem || !restockQuantity || parseFloat(restockQuantity) <= 0) {
      alert('请输入有效的补货数量');
      return;
    }

    const quantity = parseFloat(restockQuantity);
    const unitPrice = getUnitPrice(selectedRestockItem.name);
    
    const purchaseItem: PurchaseItem = {
      ingredientId: selectedRestockItem.id,
      name: selectedRestockItem.name,
      quantity,
      unit: selectedRestockItem.unit,
      unitPrice,
    };

    addPurchaseOrder({
      orderDate: new Date().toISOString().split('T')[0],
      items: [purchaseItem],
      totalAmount: quantity * unitPrice,
      status: 'pending',
      supplier: selectedRestockItem.supplier,
    });

    setRestockModalOpen(false);
    setSelectedRestockItem(null);
    setRestockQuantity('');
    showSuccess(`✅ 已提交 ${selectedRestockItem.name} 补货申请，进入审批流程`);
    setActiveTab('purchase');
  };

  const handleOpenApproveModal = (order: PurchaseOrder, action: 'approve' | 'reject') => {
    setSelectedOrder(order);
    setApproveAction(action);
    setApproveModalOpen(true);
  };

  const handleConfirmApproval = () => {
    if (!selectedOrder) return;

    if (approveAction === 'approve') {
      updatePurchaseOrder(selectedOrder.id, {
        status: 'approved',
        approver: '园长',
      });
      showSuccess(`✅ 采购单 ${selectedOrder.id} 已批准，请点击"下单"执行采购`);
    } else {
      updatePurchaseOrder(selectedOrder.id, {
        status: 'cancelled',
        approver: '园长',
      });
      showSuccess(`❌ 采购单 ${selectedOrder.id} 已拒绝`);
    }

    setApproveModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOrder = (order: PurchaseOrder) => {
    updatePurchaseOrder(order.id, {
      status: 'ordered',
      orderDate: new Date().toISOString().split('T')[0],
    });
    showSuccess(`✅ 采购单 ${order.id} 已下单给 ${order.supplier}`);
  };

  const handleOpenReceiveModal = (order: PurchaseOrder) => {
    setSelectedReceiveOrder(order);
    const quantities: Record<string, string> = {};
    order.items.forEach(item => {
      const remaining = item.quantity - (item.receivedQuantity || 0);
      quantities[item.ingredientId] = String(remaining);
    });
    setReceiveQuantities(quantities);
    setReceiveModalOpen(true);
  };

  const handleReceiveQuantityChange = (ingredientId: string, value: string) => {
    setReceiveQuantities(prev => ({
      ...prev,
      [ingredientId]: value,
    }));
  };

  const getInventoryStatus = (quantity: number, minStock: number): InventoryItem['status'] => {
    if (quantity <= 0) return 'out_of_stock';
    if (quantity < minStock) return 'low_stock';
    return 'normal';
  };

  const validateReceiveQuantities = (): { valid: boolean; error?: string } => {
    if (!selectedReceiveOrder) return { valid: false, error: '无效的采购单' };

    let hasAnyReceive = false;
    for (const item of selectedReceiveOrder.items) {
      const qtyStr = receiveQuantities[item.ingredientId];
      const remaining = item.quantity - (item.receivedQuantity || 0);

      if (qtyStr === '' || qtyStr === undefined) {
        return { valid: false, error: `${item.name} 的入库数量不能为空` };
      }

      const qty = parseFloat(qtyStr);
      if (isNaN(qty)) {
        return { valid: false, error: `${item.name} 的入库数量无效` };
      }

      if (qty < 0) {
        return { valid: false, error: `${item.name} 的入库数量不能为负数` };
      }

      if (qty > remaining) {
        return { valid: false, error: `${item.name} 的入库数量不能超过剩余未入库数量（${remaining}${item.unit}）` };
      }

      if (qty > 0) {
        hasAnyReceive = true;
      }
    }

    if (!hasAnyReceive) {
      return { valid: false, error: '请至少输入一项大于0的入库数量' };
    }

    return { valid: true };
  };

  const handleConfirmReceive = () => {
    if (!selectedReceiveOrder) return;

    const validation = validateReceiveQuantities();
    if (!validation.valid) {
      showSuccess(`❌ ${validation.error}`);
      return;
    }

    const inventoryUpdates: { itemId: string; updates: Partial<InventoryItem> }[] = [];
    const updatedItems: PurchaseItem[] = [];
    let totalReceivedQty = 0;
    let allFullyReceived = true;

    for (const item of selectedReceiveOrder.items) {
      const receivedQty = parseFloat(receiveQuantities[item.ingredientId] || '0');
      const totalReceived = (item.receivedQuantity || 0) + receivedQty;
      const remaining = item.quantity - totalReceived;

      if (receivedQty > 0) {
        const currentItem = inventoryItems.find((i: InventoryItem) => i.id === item.ingredientId);
        if (currentItem) {
          const newQuantity = currentItem.quantity + receivedQty;
          const newStatus = getInventoryStatus(newQuantity, currentItem.minStock);
          inventoryUpdates.push({
            itemId: item.ingredientId,
            updates: {
              quantity: newQuantity,
              status: newStatus,
              lastRestockDate: new Date().toISOString().split('T')[0],
            },
          });
        }
      }

      updatedItems.push({
        ...item,
        receivedQuantity: totalReceived,
      });

      totalReceivedQty += receivedQty;
      if (remaining > 0) {
        allFullyReceived = false;
      }
    }

    if (inventoryUpdates.length > 0) {
      updateInventoryItemsBatch(inventoryUpdates);
    }

    const newStatus = allFullyReceived ? 'received' : 'ordered';
    updatePurchaseOrder(selectedReceiveOrder.id, {
      items: updatedItems,
      status: newStatus,
    });

    if (allFullyReceived) {
      showSuccess(`✅ 采购单 ${selectedReceiveOrder.id} 已全部入库，共 ${totalReceivedQty.toFixed(0)} 件食材，库存已更新`);
    } else {
      showSuccess(`✅ 采购单 ${selectedReceiveOrder.id} 部分入库 ${totalReceivedQty.toFixed(0)} 件，剩余未入库部分保留`);
    }

    setReceiveModalOpen(false);
    setSelectedReceiveOrder(null);
    setReceiveQuantities({});
  };

  return (
    <div className="space-y-5">
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-4 flex items-center gap-3 animate-pulse">
          {successMessage.includes('❌') ? (
            <XCircle className="text-danger-500" size={20} />
          ) : (
            <CheckCircle className="text-success-500" size={20} />
          )}
          <span className="text-sm font-medium text-gray-800">{successMessage}</span>
        </div>
      )}

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
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="text-purple-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">待审批订单</p>
              <p className="text-xl font-bold text-purple-600">{stats.pendingOrders}单</p>
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
              {tab.key === 'purchase' && stats.pendingOrders > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-warning-500 text-white text-xs rounded-full">
                  {stats.pendingOrders}
                </span>
              )}
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
                {filteredItems.map((item: InventoryItem) => (
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
                      <button
                        onClick={() => handleSingleRestock(item)}
                        className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                      >
                        补货
                      </button>
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
              <button
                onClick={() => setActiveTab('inventory')}
                className="btn-primary flex items-center gap-1"
              >
                <Plus size={16} />
                新建采购单
              </button>
            </div>
            <div className="space-y-3">
              {purchaseOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ShoppingCart size={48} className="mx-auto mb-3 opacity-30" />
                  <p>暂无采购订单</p>
                </div>
              ) : (
                purchaseOrders.map(order => (
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
                    {(order.status === 'ordered' || order.status === 'received') && order.items.some(i => (i.receivedQuantity || 0) > 0) && (
                      <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>入库进度</span>
                          <span>
                            {order.items.reduce((sum, i) => sum + (i.receivedQuantity || 0), 0).toFixed(0)}
                            /
                            {order.items.reduce((sum, i) => sum + i.quantity, 0).toFixed(0)}
                          </span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                (order.items.reduce((sum, i) => sum + (i.receivedQuantity || 0), 0) /
                                 order.items.reduce((sum, i) => sum + i.quantity, 0)) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                    {order.approver && (
                      <p className="text-xs text-gray-400">审批人: {order.approver}</p>
                    )}
                    {order.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleOpenApproveModal(order, 'approve')}
                          className="btn-success text-xs flex-1 flex items-center justify-center gap-1"
                        >
                          <Check size={14} />
                          批准
                        </button>
                        <button
                          onClick={() => handleOpenApproveModal(order, 'reject')}
                          className="btn-danger text-xs flex-1 flex items-center justify-center gap-1"
                        >
                          <X size={14} />
                          拒绝
                        </button>
                      </div>
                    )}
                    {order.status === 'approved' && (
                      <div className="mt-3">
                        <button
                          onClick={() => handleOrder(order)}
                          className="btn-primary text-xs w-full flex items-center justify-center gap-1"
                        >
                          <ShoppingCart size={14} />
                          下单给供应商
                        </button>
                      </div>
                    )}
                    {order.status === 'ordered' && (
                      <div className="mt-3">
                        <button
                          onClick={() => handleOpenReceiveModal(order)}
                          className="btn-success text-xs w-full flex items-center justify-center gap-1"
                        >
                          <Package size={14} />
                          确认入库
                        </button>
                      </div>
                    )}
                    {order.status === 'received' && (
                      <div className="mt-3 p-2 bg-success-50 rounded-lg">
                        <p className="text-xs text-success-700 flex items-center gap-1">
                          <CheckCircle size={12} />
                          已完成入库，库存已更新
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
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

      {activeTab === 'inventory' && lowStockItems.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">智能补货建议</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAllLowStock}
                className="btn-secondary text-sm"
              >
                {selectedRestockItems.size === lowStockItems.length ? '取消全选' : '全选'}
              </button>
              <button
                onClick={handleGeneratePurchaseOrder}
                disabled={selectedRestockItems.size === 0}
                className={`flex items-center gap-1 ${
                  selectedRestockItems.size > 0 ? 'btn-primary text-sm' : 'btn-secondary text-sm opacity-50 cursor-not-allowed'
                }`}
              >
                <ShoppingCart size={16} />
                一键生成采购单
              </button>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-700">
              <AlertTriangle size={14} className="inline mr-1" />
              系统根据库存水平、消耗速度和安全库存自动计算补货建议，共有 {stats.lowStock} 项物资需要补货
            </p>
          </div>
          <div className="space-y-2">
            {lowStockItems.map((item: InventoryItem) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedRestockItems.has(item.id)}
                      onChange={() => handleToggleSelectItem(item.id)}
                      className="w-4 h-4 rounded text-primary-500 mr-3"
                    />
                  </label>
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
                      {calculateRestockQuantity(item)}{item.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">预计金额</p>
                    <p className="text-sm font-medium text-primary-600">
                      ¥{(calculateRestockQuantity(item) * getUnitPrice(item.name)).toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {selectedRestockItems.size > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                已选择 {selectedRestockItems.size} 项，预计总金额：
                <span className="font-bold text-primary-600 text-lg ml-1">
                  ¥{Array.from(selectedRestockItems).reduce((sum: number, id: string) => {
                    const item = inventoryItems.find((i: InventoryItem) => i.id === id);
                    if (!item) return sum;
                    return sum + calculateRestockQuantity(item) * getUnitPrice(item.name);
                  }, 0).toFixed(0)}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="确认生成采购单"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setConfirmModalOpen(false)} className="btn-secondary">
              取消
            </button>
            <button onClick={handleConfirmGenerateOrder} className="btn-primary">
              确认生成
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              即将生成采购单，包含以下 {selectedRestockItems.size} 项食材：
            </p>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {inventoryItems.filter((i: InventoryItem) => selectedRestockItems.has(i.id)).map((item: InventoryItem) => {
              const qty = calculateRestockQuantity(item);
              const price = getUnitPrice(item.name);
              return (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.supplier}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-800">{qty}{item.unit} × ¥{price}</p>
                    <p className="text-xs text-primary-600">¥{(qty * price).toFixed(0)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-600">预计总金额</span>
            <span className="text-xl font-bold text-primary-600">
              ¥{Array.from(selectedRestockItems).reduce((sum: number, id: string) => {
                const item = inventoryItems.find((i: InventoryItem) => i.id === id);
                if (!item) return sum;
                return sum + calculateRestockQuantity(item) * getUnitPrice(item.name);
              }, 0).toFixed(0)}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            生成后采购单将进入待审批状态，经园长批准后方可执行采购。
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={restockModalOpen}
        onClose={() => setRestockModalOpen(false)}
        title={`补货申请 - ${selectedRestockItem?.name}`}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setRestockModalOpen(false)} className="btn-secondary">
              取消
            </button>
            <button onClick={handleConfirmSingleRestock} className="btn-primary">
              提交申请
            </button>
          </div>
        }
      >
        {selectedRestockItem && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">当前库存</p>
                  <p className="font-medium text-gray-800">{selectedRestockItem.quantity} {selectedRestockItem.unit}</p>
                </div>
                <div>
                  <p className="text-gray-500">安全库存</p>
                  <p className="font-medium text-gray-800">{selectedRestockItem.minStock} {selectedRestockItem.unit}</p>
                </div>
                <div>
                  <p className="text-gray-500">最大库存</p>
                  <p className="font-medium text-gray-800">{selectedRestockItem.maxStock} {selectedRestockItem.unit}</p>
                </div>
                <div>
                  <p className="text-gray-500">供应商</p>
                  <p className="font-medium text-gray-800">{selectedRestockItem.supplier}</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">补货数量 *</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  className="input-field flex-1"
                  placeholder="请输入补货数量"
                  min="1"
                />
                <span className="text-sm text-gray-500">{selectedRestockItem.unit}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                建议补货量：{calculateRestockQuantity(selectedRestockItem)}{selectedRestockItem.unit}
                （补充至最大库存的80%）
              </p>
            </div>
            {restockQuantity && parseFloat(restockQuantity) > 0 && (
              <div className="bg-primary-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary-700">预计金额</span>
                  <span className="text-lg font-bold text-primary-600">
                    ¥{(parseFloat(restockQuantity) * getUnitPrice(selectedRestockItem.name)).toFixed(0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title={approveAction === 'approve' ? '批准采购单' : '拒绝采购单'}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setApproveModalOpen(false)} className="btn-secondary">
              取消
            </button>
            <button
              onClick={handleConfirmApproval}
              className={approveAction === 'approve' ? 'btn-success' : 'btn-danger'}
            >
              确认{approveAction === 'approve' ? '批准' : '拒绝'}
            </button>
          </div>
        }
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className={`rounded-lg p-4 ${approveAction === 'approve' ? 'bg-success-50' : 'bg-danger-50'}`}>
              <p className={`text-sm ${approveAction === 'approve' ? 'text-success-700' : 'text-danger-700'}`}>
                {approveAction === 'approve' ? (
                  <>确定要批准采购单 <strong>{selectedOrder.id}</strong> 吗？</>
                ) : (
                  <>确定要拒绝采购单 <strong>{selectedOrder.id}</strong> 吗？</>
                )}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">供应商</span>
                <span className="text-gray-800">{selectedOrder.supplier}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">采购项数</span>
                <span className="text-gray-800">{selectedOrder.items.length} 项</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">采购金额</span>
                <span className="font-bold text-primary-600">¥{selectedOrder.totalAmount}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedOrder.items.map((item, idx) => (
                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  {item.name} × {item.quantity}{item.unit}
                </span>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
        title="确认入库"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setReceiveModalOpen(false)} className="btn-secondary">
              取消
            </button>
            <button onClick={handleConfirmReceive} className="btn-success">
              确认入库
            </button>
          </div>
        }
      >
        {selectedReceiveOrder && (
          <div className="space-y-4">
            <div className="bg-success-50 rounded-lg p-4">
              <p className="text-sm text-success-700">
                采购单 <strong>{selectedReceiveOrder.id}</strong> 已到货，请确认入库数量
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">供应商</span>
                <span className="text-gray-800">{selectedReceiveOrder.supplier}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">采购金额</span>
                <span className="font-bold text-primary-600">¥{selectedReceiveOrder.totalAmount}</span>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">入库明细</p>
              {selectedReceiveOrder.items.map((item) => {
                const currentItem = inventoryItems.find((i: InventoryItem) => i.id === item.ingredientId);
                const receivedQty = item.receivedQuantity || 0;
                const remainingQty = item.quantity - receivedQty;
                const progress = (receivedQty / item.quantity) * 100;
                const inputQty = parseFloat(receiveQuantities[item.ingredientId] || '0');
                const isError = !receiveQuantities[item.ingredientId] || 
                  isNaN(inputQty) || 
                  inputQty < 0 || 
                  inputQty > remainingQty;
                return (
                  <div key={item.ingredientId} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          当前库存: {currentItem?.quantity || 0}{item.unit} · 安全库存: {currentItem?.minStock || 0}{item.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">采购数量</p>
                        <p className="text-sm font-medium text-gray-800">{item.quantity}{item.unit}</p>
                      </div>
                    </div>
                    {receivedQty > 0 && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>已入库: {receivedQty}{item.unit}</span>
                          <span>剩余: {remainingQty}{item.unit}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-success-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={receiveQuantities[item.ingredientId] || ''}
                        onChange={(e) => handleReceiveQuantityChange(item.ingredientId, e.target.value)}
                        className={`input-field flex-1 ${isError && receiveQuantities[item.ingredientId] !== undefined ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-200' : ''}`}
                        placeholder={`本次入库数量（最多${remainingQty}${item.unit}）`}
                        min="0"
                        max={remainingQty}
                      />
                      <span className="text-sm text-gray-500">{item.unit}</span>
                    </div>
                    {receiveQuantities[item.ingredientId] && !isNaN(inputQty) && inputQty >= 0 && inputQty <= remainingQty && (
                      <p className="text-xs text-success-600 mt-1">
                        入库后库存: {((currentItem?.quantity || 0) + inputQty).toFixed(0)}{item.unit}
                      </p>
                    )}
                    {isError && receiveQuantities[item.ingredientId] !== undefined && receiveQuantities[item.ingredientId] !== '' && (
                      <p className="text-xs text-danger-500 mt-1">
                        请输入 0 到 {remainingQty}{item.unit} 之间的数量
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <AlertTriangle size={14} className="inline mr-1" />
                入库完成后，系统将自动更新库存数量和库存状态，库存预警也会同步更新。
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Inventory;
