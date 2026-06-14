import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Plus,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import { ShiftSwapRequest, ScheduleItem, ClassInfo } from '../types';

const Schedule: React.FC = () => {
  const {
    schedules,
    teachers,
    classes,
    swapRequests,
    updateSwapRequest,
    updateSchedule,
    updateSchedulesBatch,
    updateTeacher,
  } = useApp();

  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [activeTab, setActiveTab] = useState('timetable');
  const [successMessage, setSuccessMessage] = useState('');
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ShiftSwapRequest | null>(null);
  const [approveAction, setApproveAction] = useState<'approve' | 'reject'>('approve');

  const daysOfWeek = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  const timeSlots = [
    '08:00-08:30',
    '08:30-09:00',
    '09:00-09:40',
    '09:50-10:30',
    '10:40-11:20',
    '11:20-12:00',
    '14:00-14:40',
    '14:50-15:30',
    '15:40-16:20',
    '16:20-17:00',
  ];

  const pendingCount = useMemo(() => 
    swapRequests.filter(r => r.status === 'pending').length,
    [swapRequests]
  );

  const teacherStats = useMemo(() => teachers.map(t => ({
    ...t,
    usageRate: ((t.currentWeeklyHours / t.maxWeeklyHours) * 100).toFixed(0),
  })), [teachers]);

  const affectedSchedulesInfo = useMemo(() => {
    if (!selectedRequest) return null;
    const dayOfWeek = getDayOfWeekFromDate(selectedRequest.originalShift.date);
    const affected = schedules.filter(s => 
      s.teacherId === selectedRequest.requesterId &&
      s.dayOfWeek === dayOfWeek &&
      isTimeInRange(s.startTime, selectedRequest.originalShift.startTime, selectedRequest.originalShift.endTime)
    );
    const totalHours = affected.reduce((sum, s) => sum + calculateHours(s.startTime, s.endTime), 0);
    return {
      count: affected.length,
      totalHours,
      courses: affected.map(s => ({ id: s.id, name: s.courseName, time: `${s.startTime}-${s.endTime}` })),
    };
  }, [selectedRequest, schedules]);

  const getCourseColor = (courseName: string) => {
    const colors = [
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-green-100 text-green-700 border-green-200',
      'bg-yellow-100 text-yellow-700 border-yellow-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-pink-100 text-pink-700 border-pink-200',
      'bg-orange-100 text-orange-700 border-orange-200',
      'bg-teal-100 text-teal-700 border-teal-200',
    ];
    const index = courseName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getSchedulesForDay = (dayIndex: number) => {
    return schedules.filter(s => {
      const matchDay = s.dayOfWeek === dayIndex + 1;
      const matchClass = selectedClass === 'all' || s.className === selectedClass;
      const matchTeacher = selectedTeacher === 'all' || s.teacherName === selectedTeacher;
      return matchDay && matchClass && matchTeacher;
    });
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleOpenApproveModal = (request: ShiftSwapRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setApproveAction(action);
    setApproveModalOpen(true);
  };

  const calculateHours = (startTime: string, endTime: string): number => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    return (endH - startH) + (endM - startM) / 60;
  };

  const getDayOfWeekFromDate = (dateStr: string): number => {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 0 ? 7 : day;
  };

  const isTimeInRange = (time: string, start: string, end: string): boolean => {
    return time >= start && time < end;
  };

  const handleConfirmApproval = () => {
    if (!selectedRequest) return;

    const now = new Date();
    const approveTime = now.toISOString().replace('T', ' ').slice(0, 19);

    if (approveAction === 'approve') {
      const requester = teachers.find(t => t.id === selectedRequest.requesterId);
      const targetTeacher = selectedRequest.targetTeacherId 
        ? teachers.find(t => t.id === selectedRequest.targetTeacherId)
        : null;

      const dayOfWeek = getDayOfWeekFromDate(selectedRequest.originalShift.date);
      const affectedSchedules = schedules.filter(s => 
        s.teacherId === selectedRequest.requesterId &&
        s.dayOfWeek === dayOfWeek &&
        isTimeInRange(s.startTime, selectedRequest.originalShift.startTime, selectedRequest.originalShift.endTime)
      );

      const totalHours = affectedSchedules.reduce((sum, s) => {
        return sum + calculateHours(s.startTime, s.endTime);
      }, 0);

      if (requester) {
        updateTeacher(requester.id, {
          currentWeeklyHours: requester.currentWeeklyHours - totalHours,
        });
      }

      if (targetTeacher) {
        updateTeacher(targetTeacher.id, {
          currentWeeklyHours: targetTeacher.currentWeeklyHours + totalHours,
        });
      }

      if (targetTeacher && affectedSchedules.length > 0) {
        const scheduleUpdates = affectedSchedules.map(s => ({
          scheduleId: s.id,
          updates: {
            teacherId: targetTeacher.id,
            teacherName: targetTeacher.name,
          },
        }));
        updateSchedulesBatch(scheduleUpdates);
      }

      updateSwapRequest(selectedRequest.id, {
        status: 'approved',
        approver: '园长',
        approveTime,
      });

      const scheduleCount = affectedSchedules.length;
      showSuccess(`✅ 调班申请已批准，${scheduleCount}节课程已调整，${totalHours.toFixed(1)}课时已同步`);
    } else {
      updateSwapRequest(selectedRequest.id, {
        status: 'rejected',
        approver: '园长',
        approveTime,
      });

      showSuccess(`❌ 调班申请已拒绝`);
    }

    setApproveModalOpen(false);
    setSelectedRequest(null);
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

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentWeek(prev => prev - 1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft size={18} className="text-gray-500" />
              </button>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {currentWeek === 0 ? '本周' : currentWeek > 0 ? `第${currentWeek + 1}周` : `上周`}
                </span>
              </div>
              <button
                onClick={() => setCurrentWeek(prev => prev + 1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight size={18} className="text-gray-500" />
              </button>
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="select-field w-40"
            >
              <option value="all">全部班级</option>
              {classes.map((c: ClassInfo) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="select-field w-40"
            >
              <option value="all">全部教师</option>
              {teachers.map(t => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary flex items-center gap-1">
              <RefreshCw size={16} />
              自动排课
            </button>
            <button className="btn-primary flex items-center gap-1">
              <Plus size={16} />
              添加课程
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 border-b border-gray-100">
          {[
            { key: 'timetable', label: '课程表' },
            { key: 'teachers', label: '教师排班' },
            { key: 'swap', label: '调班申请' },
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
              {tab.key === 'swap' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-warning-500 text-white text-xs rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'timetable' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-24 py-3 px-2 text-sm font-medium text-gray-500 bg-gray-50 border border-gray-100">
                    时间
                  </th>
                  {daysOfWeek.slice(0, 5).map((day, index) => (
                    <th
                      key={day}
                      className={`py-3 px-2 text-sm font-medium text-center border border-gray-100 ${
                        new Date().getDay() === index + 1 ? 'bg-primary-50 text-primary-600' : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(slot => {
                  const [startTime] = slot.split('-');
                  return (
                    <tr key={slot}>
                      <td className="py-2 px-2 text-xs text-gray-500 text-center border border-gray-100 bg-gray-50">
                        {slot}
                      </td>
                      {daysOfWeek.slice(0, 5).map((_, dayIndex) => {
                        const daySchedules = getSchedulesForDay(dayIndex).filter(s =>
                          s.startTime <= startTime && s.endTime > startTime
                        );
                        return (
                          <td key={dayIndex} className="border border-gray-100 p-1 min-w-32 h-14">
                            {daySchedules.map(s => (
                              <div
                                key={s.id}
                                className={`p-2 rounded-lg border text-xs ${getCourseColor(s.courseName)}`}
                              >
                                <p className="font-medium">{s.courseName}</p>
                                <p className="text-xs opacity-80 mt-0.5">{s.teacherName}</p>
                                <p className="text-xs opacity-70 mt-0.5 flex items-center gap-1">
                                  <MapPin size={10} />
                                  {s.classroom}
                                </p>
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'teachers' && (
          <div>
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-3">教师课时统计</h4>
              <div className="grid grid-cols-3 gap-4">
                {teacherStats.map(teacher => (
                  <div key={teacher.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full flex items-center justify-center">
                        <User className="text-white" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{teacher.name}</p>
                        <p className="text-xs text-gray-500">{teacher.position}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">本周课时</span>
                        <span className="font-medium text-gray-700">
                          {teacher.currentWeeklyHours}/{teacher.maxWeeklyHours}h
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            Number(teacher.usageRate) >= 90 ? 'bg-danger-500' :
                            Number(teacher.usageRate) >= 70 ? 'bg-warning-500' : 'bg-success-500'
                          }`}
                          style={{ width: `${teacher.usageRate}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {teacher.qualifications.slice(0, 2).map(q => (
                        <span key={q} className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded text-xs">
                          {q}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-blue-800">智能排课规则</p>
                  <ul className="text-sm text-blue-600 mt-1 space-y-1">
                    <li>• 教师每周课时不超过上限</li>
                    <li>• 同一教师同一时段只能有一节课</li>
                    <li>• 主课优先安排在上午</li>
                    <li>• 考虑教师资质与课程匹配度</li>
                    <li>• 体育、音乐等课程使用专用教室</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'swap' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button className="btn-primary flex items-center gap-1">
                <Plus size={16} />
                申请调班
              </button>
            </div>
            {swapRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <RefreshCw size={48} className="mx-auto mb-3 opacity-30" />
                <p>暂无调班申请</p>
              </div>
            ) : (
              <div className="space-y-3">
                {swapRequests.map(req => (
                  <div key={req.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full flex items-center justify-center">
                          <User className="text-white" size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{req.requesterName}</p>
                          <p className="text-xs text-gray-500">申请时间: {req.createTime}</p>
                        </div>
                      </div>
                      <span className={`status-badge ${
                        req.status === 'pending' ? 'bg-warning-100 text-warning-600' :
                        req.status === 'approved' ? 'bg-success-100 text-success-600' :
                        'bg-danger-100 text-danger-600'
                      }`}>
                        {req.status === 'pending' ? '待审批' : req.status === 'approved' ? '已通过' : '已拒绝'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">原班次</p>
                        <p className="text-sm font-medium text-gray-700">{req.originalShift.date}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock size={12} />
                          {req.originalShift.startTime} - {req.originalShift.endTime}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">目标班次</p>
                        {req.targetShift ? (
                          <>
                            <p className="text-sm font-medium text-gray-700">{req.targetShift.date}</p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock size={12} />
                              {req.targetShift.startTime} - {req.targetShift.endTime}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">寻找代班</p>
                        )}
                        {req.targetTeacherName && (
                          <p className="text-xs text-gray-500 mt-1">对接人: {req.targetTeacherName}</p>
                        )}
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">调班原因</p>
                      <p className="text-sm text-gray-700">{req.reason}</p>
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenApproveModal(req, 'approve')}
                          className="flex-1 btn-success flex items-center justify-center gap-1"
                        >
                          <Check size={16} />
                          同意
                        </button>
                        <button
                          onClick={() => handleOpenApproveModal(req, 'reject')}
                          className="flex-1 btn-danger flex items-center justify-center gap-1"
                        >
                          <X size={16} />
                          拒绝
                        </button>
                      </div>
                    )}
                    {req.approver && (
                      <p className="text-xs text-gray-400 mt-2">
                        审批人: {req.approver} · {req.approveTime}
                      </p>
                    )}
                    {req.status === 'approved' && (
                      <div className="mt-3 p-2 bg-success-50 rounded-lg">
                        <p className="text-xs text-success-700 flex items-center gap-1">
                          <CheckCircle size={12} />
                          课程表和教师课时统计已同步更新
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title={approveAction === 'approve' ? '批准调班申请' : '拒绝调班申请'}
        size="md"
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
        {selectedRequest && (
          <div className="space-y-4">
            <div className={`rounded-lg p-4 ${approveAction === 'approve' ? 'bg-success-50' : 'bg-danger-50'}`}>
              <p className={`text-sm ${approveAction === 'approve' ? 'text-success-700' : 'text-danger-700'}`}>
                {approveAction === 'approve' ? (
                  <>确定要批准 <strong>{selectedRequest.requesterName}</strong> 的调班申请吗？</>
                ) : (
                  <>确定要拒绝 <strong>{selectedRequest.requesterName}</strong> 的调班申请吗？</>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">原班次</p>
                <p className="text-sm font-medium text-gray-700">{selectedRequest.originalShift.date}</p>
                <p className="text-sm text-gray-600">
                  {selectedRequest.originalShift.startTime} - {selectedRequest.originalShift.endTime}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">目标班次</p>
                {selectedRequest.targetShift ? (
                  <>
                    <p className="text-sm font-medium text-gray-700">{selectedRequest.targetShift.date}</p>
                    <p className="text-sm text-gray-600">
                      {selectedRequest.targetShift.startTime} - {selectedRequest.targetShift.endTime}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">寻找代班</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">调班原因</p>
              <p className="text-sm text-gray-700">{selectedRequest.reason}</p>
            </div>

            {approveAction === 'approve' && (
              <div className="bg-primary-50 rounded-lg p-3">
                <p className="text-sm text-primary-700 font-medium mb-2">批准后将自动执行：</p>
                <ul className="text-sm text-primary-600 space-y-1">
                  <li className="flex items-center gap-1">
                    <Check size={12} />
                    更新课程表：将{affectedSchedulesInfo?.count || 0}节课程调整给{selectedRequest.targetTeacherName || '目标教师'}
                  </li>
                  {affectedSchedulesInfo?.courses && affectedSchedulesInfo.courses.length > 0 && (
                    <li className="ml-5 text-xs text-primary-500">
                      涉及课程：{affectedSchedulesInfo.courses.map(c => `${c.name}(${c.time})`).join('、')}
                    </li>
                  )}
                  <li className="flex items-center gap-1">
                    <Check size={12} />
                    调整{selectedRequest.requesterName}的课时（减少{affectedSchedulesInfo?.totalHours.toFixed(1) || 0}小时）
                  </li>
                  {selectedRequest.targetTeacherName && (
                    <li className="flex items-center gap-1">
                      <Check size={12} />
                      调整{selectedRequest.targetTeacherName}的课时（增加{affectedSchedulesInfo?.totalHours.toFixed(1) || 0}小时）
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Schedule;
