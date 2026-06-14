export interface Child {
  id: string;
  name: string;
  gender: '男' | '女';
  birthDate: string;
  age: number;
  className: string;
  bedNumber?: string;
  photo?: string;
  allergies: string[];
  specialConstitution: string[];
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  enrollmentDate: string;
  status: 'in_school' | 'leave' | 'absent' | 'sick';
}

export interface ClassInfo {
  id: string;
  name: string;
  grade: '小班' | '中班' | '大班' | '学前班';
  capacity: number;
  currentCount: number;
  headTeacher: string;
  assistantTeacher: string;
  classroom: string;
  bedroom: string;
}

export interface Teacher {
  id: string;
  name: string;
  gender: '男' | '女';
  position: string;
  qualifications: string[];
  subject: string;
  maxWeeklyHours: number;
  currentWeeklyHours: number;
  phone: string;
  photo?: string;
  status: 'on_duty' | 'leave' | 'off_duty';
}

export interface Course {
  id: string;
  name: string;
  type: string;
  duration: number;
  teacherId: string;
  classroom: string;
}

export interface ScheduleItem {
  id: string;
  classId: string;
  className: string;
  courseId: string;
  courseName: string;
  teacherId: string;
  teacherName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classroom: string;
}

export interface Recipe {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack_morning' | 'snack_afternoon';
  mealName: string;
  dishes: Dish[];
  nutritionFacts: NutritionFacts;
}

export interface Dish {
  id: string;
  name: string;
  ingredients: Ingredient[];
  allergens: string[];
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface NutritionFacts {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  vitamins: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  lastRestockDate: string;
  expiryDate?: string;
  supplier: string;
  status: 'normal' | 'low_stock' | 'out_of_stock' | 'expiring';
}

export interface PurchaseOrder {
  id: string;
  orderDate: string;
  items: PurchaseItem[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  supplier: string;
  approver?: string;
}

export interface PurchaseItem {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  receivedQuantity?: number;
}

export interface AttendanceRecord {
  id: string;
  childId: string;
  childName: string;
  className: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'leave' | 'late' | 'early_leave';
  checkInMethod?: 'face' | 'card' | 'manual';
  checkOutMethod?: 'face' | 'card' | 'manual';
  pickUpPerson?: string;
  pickUpRelation?: string;
}

export interface HealthCheckRecord {
  id: string;
  childId: string;
  childName: string;
  className: string;
  date: string;
  temperature: number;
  hasFever: boolean;
  hasCough: boolean;
  hasRash: boolean;
  hasDiarrhea: boolean;
  otherSymptoms?: string;
  handWashing: boolean;
  mouthCheck: boolean;
  skinCheck: boolean;
  result: 'normal' | 'abnormal' | 'need_attention';
  notes?: string;
  examiner: string;
}

export interface PickupRecord {
  id: string;
  childId: string;
  childName: string;
  className: string;
  date: string;
  time: string;
  pickUpPerson: string;
  relation: string;
  verificationMethod: 'face' | 'card' | 'manual';
  authorized: boolean;
  photo?: string;
}

export interface SecurityAlert {
  id: string;
  type: 'unauthorized_pickup' | 'timeout_pickup' | 'stranger_detected' | 'equipment_abnormal' | 'fire_alarm';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  handler?: string;
  photo?: string;
}

export interface FinancialBill {
  id: string;
  childId: string;
  childName: string;
  className: string;
  month: string;
  tuitionFee: number;
  mealFee: number;
  otherFee: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'unpaid' | 'partial' | 'paid' | 'overdue';
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  remarks?: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  location: string;
  model: string;
  installDate: string;
  runHours: number;
  maintenanceCycle: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  status: 'normal' | 'warning' | 'fault' | 'maintenance';
  spareParts: SparePart[];
}

export interface SparePart {
  id: string;
  name: string;
  quantity: number;
  minStock: number;
  unit: string;
}

export interface MaintenanceWorkOrder {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'routine' | 'fault' | 'inspection';
  description: string;
  assignedTeam: string;
  assignee?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createTime: string;
  startTime?: string;
  endTime?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ActivityZone {
  id: string;
  name: string;
  type: string;
  capacity: number;
  currentCount: number;
  position: { x: number; y: number; width: number; height: number };
  teachers: string[];
  status: 'idle' | 'normal' | 'busy' | 'full';
}

export interface StatisticsData {
  dateRange: { start: string; end: string };
  attendanceRate: number;
  avgAttendanceRate: number;
  accidentCount: number;
  parentSatisfaction: number;
  byClass: ClassStats[];
  byDay: DailyStats[];
}

export interface ClassStats {
  classId: string;
  className: string;
  attendanceRate: number;
  accidentCount: number;
  satisfaction: number;
  childCount: number;
}

export interface DailyStats {
  date: string;
  attendanceRate: number;
  checkInCount: number;
  checkOutCount: number;
  absentCount: number;
}

export interface ShiftSwapRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  targetTeacherId?: string;
  targetTeacherName?: string;
  originalShift: { date: string; startTime: string; endTime: string };
  targetShift?: { date: string; startTime: string; endTime: string };
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approver?: string;
  approveTime?: string;
  createTime: string;
}
