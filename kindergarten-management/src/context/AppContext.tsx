import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
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
  updateTeacher: (teacherId: string, updates: Partial<Teacher>) => void;
  updateClass: (classId: string, updates: Partial<ClassInfo>) => void;
  updateInventoryItem: (itemId: string, updates: Partial<InventoryItem>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [childrenState, setChildren] = useState<Child[]>(initialChildren);
  const [classesState, setClasses] = useState<ClassInfo[]>(initialClasses);
  const [inventoryItemsState, setInventoryItems] = useState<InventoryItem[]>(initialInventoryItems);
  const [bills, setBills] = useState<FinancialBill[]>(initialBills);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(initialAlerts);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>(initialSwapRequests);
  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialSchedules);
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>(initialPaymentRecords);
  const [pickupRecords, setPickupRecords] = useState<PickupRecord[]>(initialPickupRecords);
  const [authorizedPersons, setAuthorizedPersons] = useState<AuthorizedPerson[]>(initialAuthorizedPersons);

  const addChild = useCallback((child: Omit<Child, 'id'>) => {
    const newId = `c${String(childrenState.length + 1).padStart(3, '0')}`;
    setChildren(prev => [...prev, { ...child, id: newId }]);
  }, [childrenState.length]);

  const updateBill = useCallback((billId: string, updates: Partial<FinancialBill>) => {
    setBills(prev => prev.map(b => b.id === billId ? { ...b, ...updates } : b));
  }, []);

  const addPayment = useCallback((payment: PaymentRecord) => {
    setPaymentRecords(prev => [...prev, payment]);
  }, []);

  const addAlert = useCallback((alert: Omit<SecurityAlert, 'id'>) => {
    const newId = `alert${String(alerts.length + 1).padStart(3, '0')}`;
    setAlerts(prev => [{ ...alert, id: newId }, ...prev]);
  }, [alerts.length]);

  const updateAlert = useCallback((alertId: string, updates: Partial<SecurityAlert>) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, ...updates } : a));
  }, []);

  const addPurchaseOrder = useCallback((order: Omit<PurchaseOrder, 'id'>) => {
    const newId = `po${String(purchaseOrders.length + 1).padStart(3, '0')}`;
    setPurchaseOrders(prev => [...prev, { ...order, id: newId }]);
  }, [purchaseOrders.length]);

  const updatePurchaseOrder = useCallback((orderId: string, updates: Partial<PurchaseOrder>) => {
    setPurchaseOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
  }, []);

  const updateSwapRequest = useCallback((requestId: string, updates: Partial<ShiftSwapRequest>) => {
    setSwapRequests(prev => prev.map(r => r.id === requestId ? { ...r, ...updates } : r));
  }, []);

  const addPickupRecord = useCallback((record: PickupRecord) => {
    setPickupRecords(prev => [record, ...prev]);
  }, []);

  const addAuthorizedPerson = useCallback((person: Omit<AuthorizedPerson, 'id'>) => {
    const newId = `ap${String(authorizedPersons.length + 1).padStart(3, '0')}`;
    setAuthorizedPersons(prev => [...prev, { ...person, id: newId }]);
  }, [authorizedPersons.length]);

  const updateAuthorizedPerson = useCallback((personId: string, updates: Partial<AuthorizedPerson>) => {
    setAuthorizedPersons(prev => prev.map(p => p.id === personId ? { ...p, ...updates } : p));
  }, []);

  const deleteAuthorizedPerson = useCallback((personId: string) => {
    setAuthorizedPersons(prev => prev.filter(p => p.id !== personId));
  }, []);

  const updateSchedule = useCallback((scheduleId: string, updates: Partial<ScheduleItem>) => {
    setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, ...updates } : s));
  }, []);

  const updateTeacher = useCallback((teacherId: string, updates: Partial<Teacher>) => {
    setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, ...updates } : t));
  }, []);

  const updateClass = useCallback((classId: string, updates: Partial<ClassInfo>) => {
    setClasses(prev => prev.map(c => c.id === classId ? { ...c, ...updates } : c));
  }, []);

  const updateInventoryItem = useCallback((itemId: string, updates: Partial<InventoryItem>) => {
    setInventoryItems(prev => prev.map(i => i.id === itemId ? { ...i, ...updates } : i));
  }, []);

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
      updateTeacher,
      updateClass,
      updateInventoryItem,
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
