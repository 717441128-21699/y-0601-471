import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  Child,
  FinancialBill,
  SecurityAlert,
  PurchaseOrder,
  ShiftSwapRequest,
  ScheduleItem,
  Teacher,
  PickupRecord,
  ClassInfo,
  InventoryItem,
} from '../types';
import {
  children as initialChildren,
  financialBills as initialBills,
  securityAlerts as initialAlerts,
  purchaseOrders as initialPurchaseOrders,
  shiftSwapRequests as initialSwapRequests,
  schedules as initialSchedules,
  teachers as initialTeachers,
  classes as initialClasses,
  inventoryItems as initialInventoryItems,
} from '../data/mockData';

export interface PaymentRecord {
  id: string;
  billId: string;
  childId: string;
  childName: string;
  className: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  remark?: string;
}

export interface AuthorizedPerson {
  id: string;
  childId: string;
  childName: string;
  name: string;
  relation: string;
  phone: string;
  idCard?: string;
  photo?: string;
  isAuthorized: boolean;
  createdDate: string;
}

interface AppContextType {
  children: Child[];
  classes: ClassInfo[];
  inventoryItems: InventoryItem[];
  bills: FinancialBill[];
  alerts: SecurityAlert[];
  purchaseOrders: PurchaseOrder[];
  swapRequests: ShiftSwapRequest[];
  schedules: ScheduleItem[];
  teachers: Teacher[];
  paymentRecords: PaymentRecord[];
  pickupRecords: PickupRecord[];
  authorizedPersons: AuthorizedPerson[];
  addChild: (child: Omit<Child, 'id'>) => void;
  updateBill: (billId: string, updates: Partial<FinancialBill>) => void;
  addPayment: (payment: PaymentRecord) => void;
  addAlert: (alert: Omit<SecurityAlert, 'id'>) => void;
  updateAlert: (alertId: string, updates: Partial<SecurityAlert>) => void;
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id'>) => void;
  updatePurchaseOrder: (orderId: string, updates: Partial<PurchaseOrder>) => void;
  updateSwapRequest: (requestId: string, updates: Partial<ShiftSwapRequest>) => void;
  addPickupRecord: (record: PickupRecord) => void;
  addAuthorizedPerson: (person: Omit<AuthorizedPerson, 'id'>) => void;
  updateAuthorizedPerson: (personId: string, updates: Partial<AuthorizedPerson>) => void;
  deleteAuthorizedPerson: (personId: string) => void;
  updateSchedule: (scheduleId: string, updates: Partial<ScheduleItem>) => void;
  updateSchedulesBatch: (updates: { scheduleId: string; updates: Partial<ScheduleItem> }[]) => void;
  updateTeacher: (teacherId: string, updates: Partial<Teacher>) => void;
  updateClass: (classId: string, updates: Partial<ClassInfo>) => void;
  updateClassesBatch: (updates: { classId: string; updates: Partial<ClassInfo> }[]) => void;
  updateInventoryItem: (itemId: string, updates: Partial<InventoryItem>) => void;
  updateInventoryItemsBatch: (updates: { itemId: string; updates: Partial<InventoryItem> }[]) => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'kindergarten_management_data';

const initialPickupRecords: PickupRecord[] = [
  { id: 'pickup001', childId: 'c001', childName: '张小明', className: '太阳一班', date: new Date().toISOString().split('T')[0], time: '16:30', pickUpPerson: '张伟', relation: '父亲', verificationMethod: 'face', authorized: true },
  { id: 'pickup002', childId: 'c002', childName: '李小红', className: '太阳一班', date: new Date().toISOString().split('T')[0], time: '16:35', pickUpPerson: '李芳', relation: '母亲', verificationMethod: 'face', authorized: true },
];

const initialAuthorizedPersons: AuthorizedPerson[] = [
  { id: 'ap001', childId: 'c001', childName: '张小明', name: '张伟', relation: '父亲', phone: '13800138001', isAuthorized: true, createdDate: '2023-09-01' },
  { id: 'ap002', childId: 'c001', childName: '张小明', name: '王芳', relation: '母亲', phone: '13800138001', isAuthorized: true, createdDate: '2023-09-01' },
  { id: 'ap003', childId: 'c002', childName: '李小红', name: '李芳', relation: '母亲', phone: '13800138002', isAuthorized: true, createdDate: '2023-09-01' },
  { id: 'ap004', childId: 'c003', childName: '王小强', name: '王建国', relation: '父亲', phone: '13800138003', isAuthorized: true, createdDate: '2024-02-15' },
  { id: 'ap005', childId: 'c004', childName: '陈小美', name: '陈美丽', relation: '母亲', phone: '13800138004', isAuthorized: true, createdDate: '2022-09-01' },
];

const initialPaymentRecords: PaymentRecord[] = [];

interface PersistedData {
  children: Child[];
  classes: ClassInfo[];
  inventoryItems: InventoryItem[];
  bills: FinancialBill[];
  alerts: SecurityAlert[];
  purchaseOrders: PurchaseOrder[];
  swapRequests: ShiftSwapRequest[];
  schedules: ScheduleItem[];
  teachers: Teacher[];
  paymentRecords: PaymentRecord[];
  pickupRecords: PickupRecord[];
  authorizedPersons: AuthorizedPerson[];
}

const getDefaultData = (): PersistedData => ({
  children: initialChildren,
  classes: initialClasses,
  inventoryItems: initialInventoryItems,
  bills: initialBills,
  alerts: initialAlerts,
  purchaseOrders: initialPurchaseOrders,
  swapRequests: initialSwapRequests,
  schedules: initialSchedules,
  teachers: initialTeachers,
  paymentRecords: initialPaymentRecords,
  pickupRecords: initialPickupRecords,
  authorizedPersons: initialAuthorizedPersons,
});

const loadFromStorage = (): PersistedData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load data from localStorage:', e);
  }
  return getDefaultData();
};

const saveToStorage = (data: PersistedData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data to localStorage:', e);
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [persistedData, setPersistedData] = useState<PersistedData>(() => loadFromStorage());

  useEffect(() => {
    saveToStorage(persistedData);
  }, [persistedData]);

  const {
    children: childrenState,
    classes: classesState,
    inventoryItems: inventoryItemsState,
    bills,
    alerts,
    purchaseOrders,
    swapRequests,
    schedules,
    teachers,
    paymentRecords,
    pickupRecords,
    authorizedPersons,
  } = persistedData;

  const updatePersistedData = useCallback((updates: Partial<PersistedData>) => {
    setPersistedData(prev => ({ ...prev, ...updates }));
  }, []);

  const addChild = useCallback((child: Omit<Child, 'id'>) => {
    const maxId = Math.max(...childrenState.map(c => parseInt(c.id.replace('c', ''))), 0);
    const newId = `c${String(maxId + 1).padStart(3, '0')}`;
    const newChild = { ...child, id: newId };
    
    const updatedClasses = classesState.map((c: ClassInfo) => 
      c.name === child.className 
        ? { ...c, currentCount: c.currentCount + 1 }
        : c
    );

    updatePersistedData({
      children: [...childrenState, newChild],
      classes: updatedClasses,
    });
  }, [childrenState, classesState, updatePersistedData]);

  const updateBill = useCallback((billId: string, updates: Partial<FinancialBill>) => {
    updatePersistedData({
      bills: bills.map(b => b.id === billId ? { ...b, ...updates } : b),
    });
  }, [bills, updatePersistedData]);

  const addPayment = useCallback((payment: PaymentRecord) => {
    updatePersistedData({
      paymentRecords: [...paymentRecords, payment],
    });
  }, [paymentRecords, updatePersistedData]);

  const addAlert = useCallback((alert: Omit<SecurityAlert, 'id'>) => {
    const maxId = Math.max(...alerts.map(a => parseInt(a.id.replace('alert', ''))), 0);
    const newId = `alert${String(maxId + 1).padStart(3, '0')}`;
    updatePersistedData({
      alerts: [{ ...alert, id: newId }, ...alerts],
    });
  }, [alerts, updatePersistedData]);

  const updateAlert = useCallback((alertId: string, updates: Partial<SecurityAlert>) => {
    updatePersistedData({
      alerts: alerts.map(a => a.id === alertId ? { ...a, ...updates } : a),
    });
  }, [alerts, updatePersistedData]);

  const addPurchaseOrder = useCallback((order: Omit<PurchaseOrder, 'id'>) => {
    const maxId = Math.max(...purchaseOrders.map(o => parseInt(o.id.replace('po', ''))), 0);
    const newId = `po${String(maxId + 1).padStart(3, '0')}`;
    updatePersistedData({
      purchaseOrders: [...purchaseOrders, { ...order, id: newId }],
    });
  }, [purchaseOrders, updatePersistedData]);

  const updatePurchaseOrder = useCallback((orderId: string, updates: Partial<PurchaseOrder>) => {
    updatePersistedData({
      purchaseOrders: purchaseOrders.map(o => o.id === orderId ? { ...o, ...updates } : o),
    });
  }, [purchaseOrders, updatePersistedData]);

  const updateSwapRequest = useCallback((requestId: string, updates: Partial<ShiftSwapRequest>) => {
    updatePersistedData({
      swapRequests: swapRequests.map(r => r.id === requestId ? { ...r, ...updates } : r),
    });
  }, [swapRequests, updatePersistedData]);

  const addPickupRecord = useCallback((record: PickupRecord) => {
    updatePersistedData({
      pickupRecords: [record, ...pickupRecords],
    });
  }, [pickupRecords, updatePersistedData]);

  const addAuthorizedPerson = useCallback((person: Omit<AuthorizedPerson, 'id'>) => {
    const maxId = Math.max(...authorizedPersons.map(p => parseInt(p.id.replace('ap', ''))), 0);
    const newId = `ap${String(maxId + 1).padStart(3, '0')}`;
    updatePersistedData({
      authorizedPersons: [...authorizedPersons, { ...person, id: newId }],
    });
  }, [authorizedPersons, updatePersistedData]);

  const updateAuthorizedPerson = useCallback((personId: string, updates: Partial<AuthorizedPerson>) => {
    updatePersistedData({
      authorizedPersons: authorizedPersons.map(p => p.id === personId ? { ...p, ...updates } : p),
    });
  }, [authorizedPersons, updatePersistedData]);

  const deleteAuthorizedPerson = useCallback((personId: string) => {
    updatePersistedData({
      authorizedPersons: authorizedPersons.filter(p => p.id !== personId),
    });
  }, [authorizedPersons, updatePersistedData]);

  const updateSchedule = useCallback((scheduleId: string, updates: Partial<ScheduleItem>) => {
    updatePersistedData({
      schedules: schedules.map(s => s.id === scheduleId ? { ...s, ...updates } : s),
    });
  }, [schedules, updatePersistedData]);

  const updateSchedulesBatch = useCallback((updates: { scheduleId: string; updates: Partial<ScheduleItem> }[]) => {
    const updatedSchedules = schedules.map(s => {
      const match = updates.find(u => u.scheduleId === s.id);
      return match ? { ...s, ...match.updates } : s;
    });
    updatePersistedData({ schedules: updatedSchedules });
  }, [schedules, updatePersistedData]);

  const updateTeacher = useCallback((teacherId: string, updates: Partial<Teacher>) => {
    updatePersistedData({
      teachers: teachers.map(t => t.id === teacherId ? { ...t, ...updates } : t),
    });
  }, [teachers, updatePersistedData]);

  const updateClass = useCallback((classId: string, updates: Partial<ClassInfo>) => {
    updatePersistedData({
      classes: classesState.map(c => c.id === classId ? { ...c, ...updates } : c),
    });
  }, [classesState, updatePersistedData]);

  const updateClassesBatch = useCallback((updates: { classId: string; updates: Partial<ClassInfo> }[]) => {
    const updatedClasses = classesState.map(c => {
      const match = updates.find(u => u.classId === c.id);
      return match ? { ...c, ...match.updates } : c;
    });
    updatePersistedData({ classes: updatedClasses });
  }, [classesState, updatePersistedData]);

  const updateInventoryItem = useCallback((itemId: string, updates: Partial<InventoryItem>) => {
    updatePersistedData({
      inventoryItems: inventoryItemsState.map(i => i.id === itemId ? { ...i, ...updates } : i),
    });
  }, [inventoryItemsState, updatePersistedData]);

  const updateInventoryItemsBatch = useCallback((updates: { itemId: string; updates: Partial<InventoryItem> }[]) => {
    const updatedItems = inventoryItemsState.map(i => {
      const match = updates.find(u => u.itemId === i.id);
      return match ? { ...i, ...match.updates } : i;
    });
    updatePersistedData({ inventoryItems: updatedItems });
  }, [inventoryItemsState, updatePersistedData]);

  const resetData = useCallback(() => {
    const defaultData = getDefaultData();
    updatePersistedData(defaultData);
  }, [updatePersistedData]);

  return (
    <AppContext.Provider value={{
      children: childrenState,
      classes: classesState,
      inventoryItems: inventoryItemsState,
      bills,
      alerts,
      purchaseOrders,
      swapRequests,
      schedules,
      teachers,
      paymentRecords,
      pickupRecords,
      authorizedPersons,
      addChild,
      updateBill,
      addPayment,
      addAlert,
      updateAlert,
      addPurchaseOrder,
      updatePurchaseOrder,
      updateSwapRequest,
      addPickupRecord,
      addAuthorizedPerson,
      updateAuthorizedPerson,
      deleteAuthorizedPerson,
      updateSchedule,
      updateSchedulesBatch,
      updateTeacher,
      updateClass,
      updateClassesBatch,
      updateInventoryItem,
      updateInventoryItemsBatch,
      resetData,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
