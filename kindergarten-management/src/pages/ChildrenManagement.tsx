import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, MoreVertical, Baby, Phone, AlertTriangle, Bed, Calendar, Sparkles, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import { Child, ClassInfo } from '../types';

interface ClassAssignment {
  className: string;
  grade: string;
  reason: string;
  confidence: number;
}

interface BedAssignment {
  bedNumber: string;
  bedroom: string;
  reason: string;
}

const ChildrenManagement: React.FC = () => {
  const { children, classes, addChild } = useApp();

  const [selectedClass, setSelectedClass] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [recommendedClass, setRecommendedClass] = useState<ClassAssignment | null>(null);
  const [recommendedBed, setRecommendedBed] = useState<BedAssignment | null>(null);

  const [newChildForm, setNewChildForm] = useState({
    name: '',
    gender: '男' as '男' | '女',
    birthDate: '',
    age: 0,
    allergies: '' as string,
    specialConstitution: '' as string,
    guardianName: '',
    guardianPhone: '',
    guardianRelation: '',
    className: '',
    bedNumber: '',
  });

  const filteredChildren = useMemo(() => children.filter(child => {
    const matchesClass = selectedClass === 'all' || child.className === selectedClass;
    const matchesSearch = child.name.includes(searchText) || child.id.includes(searchText);
    const matchesStatus = activeTab === 'all' || 
      (activeTab === 'in_school' && child.status === 'in_school') ||
      (activeTab === 'leave' && child.status === 'leave') ||
      (activeTab === 'absent' && child.status === 'absent') ||
      (activeTab === 'special' && child.allergies.length > 0);
    return matchesClass && matchesSearch && matchesStatus;
  }), [children, selectedClass, searchText, activeTab]);

  const stats = useMemo(() => ({
    total: children.length,
    inSchool: children.filter(c => c.status === 'in_school').length,
    leave: children.filter(c => c.status === 'leave').length,
    absent: children.filter(c => c.status === 'absent').length,
    special: children.filter(c => c.allergies.length > 0 || c.specialConstitution.length > 0).length,
  }), [children]);

  const getStatusBadge = (status: Child['status']) => {
    const styles: Record<string, string> = {
      in_school: 'bg-success-100 text-success-600',
      leave: 'bg-warning-100 text-warning-600',
      absent: 'bg-gray-100 text-gray-600',
      sick: 'bg-danger-100 text-danger-600',
    };
    const labels: Record<string, string> = {
      in_school: '在园',
      leave: '请假',
      absent: '缺勤',
      sick: '病假',
    };
    return <span className={`status-badge ${styles[status]}`}>{labels[status]}</span>;
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getGradeByAge = (age: number): string => {
    if (age >= 6) return '学前班';
    if (age >= 5) return '大班';
    if (age >= 4) return '中班';
    if (age >= 3) return '小班';
    return '托班';
  };

  const getBedPrefixByClass = (className: string): string => {
    if (className.includes('太阳')) return 'A';
    if (className.includes('月亮')) return 'B';
    if (className.includes('星星')) return 'C';
    return 'D';
  };

  const recommendClass = (age: number, allergies: string[], specialConstitution: string[]): ClassAssignment => {
    const targetGrade = getGradeByAge(age);
    const availableClasses = classes.filter((c: ClassInfo) => c.grade === targetGrade && c.currentCount < c.capacity);

    if (availableClasses.length === 0) {
      const fallbackClasses = classes.filter((c: ClassInfo) => c.currentCount < c.capacity);
      if (fallbackClasses.length === 0) {
        return { className: classes[0].name, grade: classes[0].grade, reason: '所有班级已满，推荐到最近的班级', confidence: 30 };
      }
      const cls = fallbackClasses[0];
      return { className: cls.name, grade: cls.grade, reason: `年龄匹配${targetGrade}但已满，推荐${cls.grade}`, confidence: 60 };
    }

    if (allergies.length > 0 || specialConstitution.length > 0) {
      const scoredClasses = availableClasses.map((cls: ClassInfo) => {
        const classChildren = children.filter(c => c.className === cls.name);
        const specialCount = classChildren.filter(c => c.allergies.length > 0 || c.specialConstitution.length > 0).length;
        const capacityScore = (1 - cls.currentCount / cls.capacity) * 40;
        const specialScore = (1 - specialCount / Math.max(cls.currentCount, 1)) * 60;
        return { cls, score: capacityScore + specialScore, specialCount };
      });

      scoredClasses.sort((a: { cls: ClassInfo; score: number; specialCount: number }, b: { cls: ClassInfo; score: number; specialCount: number }) => b.score - a.score);
      const best = scoredClasses[0];
      
      let reason = `年龄${age}岁匹配${targetGrade}，`;
      if (allergies.length > 0) reason += `有${allergies.length}项过敏，`;
      if (specialConstitution.length > 0) reason += `有${specialConstitution.length}项特殊体质，`;
      reason += `该班特殊体质幼儿比例较低(${best.specialCount}/${best.cls.currentCount}人)，师资配置优`;

      return { className: best.cls.name, grade: best.cls.grade, reason, confidence: Math.round(best.score) };
    }

    const sortedByCapacity = [...availableClasses].sort((a, b) => 
      (a.currentCount / a.capacity) - (b.currentCount / b.capacity)
    );
    const best = sortedByCapacity[0];
    const occupancy = Math.round((best.currentCount / best.capacity) * 100);

    return { 
      className: best.name, 
      grade: best.grade, 
      reason: `年龄${age}岁匹配${targetGrade}，该班当前入住率${occupancy}%，床位充足`, 
      confidence: 95 
    };
  };

  const recommendBed = (className: string, allergies: string[], specialConstitution: string[]): BedAssignment => {
    const classInfo = classes.find((c: ClassInfo) => c.name === className);
    if (!classInfo) {
      return { bedNumber: 'A-01', bedroom: '宿舍楼A栋201', reason: '默认分配', };
    }

    const classChildren = children.filter(c => c.className === className);
    const usedBeds = classChildren.filter(c => c.bedNumber).map(c => c.bedNumber!);
    const prefix = getBedPrefixByClass(className);

    let bedNum = 1;
    let recommendedBedNum = '';
    
    while (bedNum <= classInfo.capacity) {
      const candidate = `${prefix}-${String(bedNum).padStart(2, '0')}`;
      if (!usedBeds.includes(candidate)) {
        if (allergies.length > 0 || specialConstitution.length > 0) {
          const adjacent1 = `${prefix}-${String(bedNum - 1).padStart(2, '0')}`;
          const adjacent2 = `${prefix}-${String(bedNum + 1).padStart(2, '0')}`;
          const adjacentChild1 = classChildren.find(c => c.bedNumber === adjacent1);
          const adjacentChild2 = classChildren.find(c => c.bedNumber === adjacent2);
          
          const hasAdjacentSpecial = 
            (adjacentChild1 && (adjacentChild1.allergies.length > 0 || adjacentChild1.specialConstitution.length > 0)) ||
            (adjacentChild2 && (adjacentChild2.allergies.length > 0 || adjacentChild2.specialConstitution.length > 0));
          
          if (hasAdjacentSpecial) {
            bedNum++;
            continue;
          }
        }
        recommendedBedNum = candidate;
        break;
      }
      bedNum++;
    }

    if (!recommendedBedNum) {
      recommendedBedNum = `${prefix}-${String(usedBeds.length + 1).padStart(2, '0')}`;
    }

    let reason = `分配至${classInfo.bedroom}，床位${recommendedBedNum}`;
    if (allergies.length > 0 || specialConstitution.length > 0) {
      reason += '，已避开相邻床位的特殊体质幼儿';
    }

    return { bedNumber: recommendedBedNum, bedroom: classInfo.bedroom, reason };
  };

  const handleBirthDateChange = (birthDate: string) => {
    const age = calculateAge(birthDate);
    setNewChildForm({ ...newChildForm, birthDate, age });
    
    if (age >= 3) {
      const allergies = newChildForm.allergies ? newChildForm.allergies.split(/[,，]/).filter(Boolean) : [];
      const specialConstitution = newChildForm.specialConstitution ? newChildForm.specialConstitution.split(/[,，]/).filter(Boolean) : [];
      
      const classRec = recommendClass(age, allergies, specialConstitution);
      const bedRec = recommendBed(classRec.className, allergies, specialConstitution);
      
      setRecommendedClass(classRec);
      setRecommendedBed(bedRec);
      setNewChildForm(prev => ({
        ...prev,
        birthDate,
        age,
        className: classRec.className,
        bedNumber: bedRec.bedNumber,
      }));
      setShowRecommendation(true);
    } else {
      setShowRecommendation(false);
      setRecommendedClass(null);
      setRecommendedBed(null);
    }
  };

  const handleAllergyChange = (value: string) => {
    setNewChildForm({ ...newChildForm, allergies: value });
    if (newChildForm.age >= 3) {
      const allergies = value ? value.split(/[,，]/).filter(Boolean) : [];
      const specialConstitution = newChildForm.specialConstitution ? newChildForm.specialConstitution.split(/[,，]/).filter(Boolean) : [];
      
      const classRec = recommendClass(newChildForm.age, allergies, specialConstitution);
      const bedRec = recommendBed(classRec.className, allergies, specialConstitution);
      
      setRecommendedClass(classRec);
      setRecommendedBed(bedRec);
      setNewChildForm(prev => ({
        ...prev,
        allergies: value,
        className: classRec.className,
        bedNumber: bedRec.bedNumber,
      }));
    }
  };

  const handleSpecialConstitutionChange = (value: string) => {
    setNewChildForm({ ...newChildForm, specialConstitution: value });
    if (newChildForm.age >= 3) {
      const allergies = newChildForm.allergies ? newChildForm.allergies.split(/[,，]/).filter(Boolean) : [];
      const specialConstitution = value ? value.split(/[,，]/).filter(Boolean) : [];
      
      const classRec = recommendClass(newChildForm.age, allergies, specialConstitution);
      const bedRec = recommendBed(classRec.className, allergies, specialConstitution);
      
      setRecommendedClass(classRec);
      setRecommendedBed(bedRec);
      setNewChildForm(prev => ({
        ...prev,
        specialConstitution: value,
        className: classRec.className,
        bedNumber: bedRec.bedNumber,
      }));
    }
  };

  const handleAddChild = () => {
    if (!newChildForm.name || !newChildForm.birthDate || !newChildForm.guardianName || !newChildForm.guardianPhone) {
      alert('请填写必填信息');
      return;
    }

    const allergies = newChildForm.allergies ? newChildForm.allergies.split(/[,，]/).filter(Boolean) : [];
    const specialConstitution = newChildForm.specialConstitution ? newChildForm.specialConstitution.split(/[,，]/).filter(Boolean) : [];

    addChild({
      name: newChildForm.name,
      gender: newChildForm.gender,
      birthDate: newChildForm.birthDate,
      age: newChildForm.age,
      className: newChildForm.className || recommendedClass?.className || classes[0].name,
      bedNumber: newChildForm.bedNumber || recommendedBed?.bedNumber,
      allergies,
      specialConstitution,
      guardianName: newChildForm.guardianName,
      guardianPhone: newChildForm.guardianPhone,
      guardianRelation: newChildForm.guardianRelation,
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'in_school',
    });

    showSuccess(`✅ ${newChildForm.name} 已成功入托 ${newChildForm.className}，床位 ${newChildForm.bedNumber}`);
    setAddModalOpen(false);
    setNewChildForm({
      name: '',
      gender: '男',
      birthDate: '',
      age: 0,
      allergies: '',
      specialConstitution: '',
      guardianName: '',
      guardianPhone: '',
      guardianRelation: '',
      className: '',
      bedNumber: '',
    });
    setShowRecommendation(false);
    setRecommendedClass(null);
    setRecommendedBed(null);
  };

  return (
    <div className="space-y-5">
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-4 flex items-center gap-3 animate-pulse">
          <CheckCircle className="text-success-500" size={20} />
          <span className="text-sm font-medium text-gray-800">{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-5 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">幼儿总数</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}人</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">在园</p>
          <p className="text-2xl font-bold text-success-600 mt-1">{stats.inSchool}人</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">请假</p>
          <p className="text-2xl font-bold text-warning-600 mt-1">{stats.leave}人</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">缺勤</p>
          <p className="text-2xl font-bold text-gray-500 mt-1">{stats.absent}人</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">特殊体质</p>
          <p className="text-2xl font-bold text-danger-500 mt-1">{stats.special}人</p>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">班级容量</h3>
        <div className="grid grid-cols-3 gap-4">
          {classes.map((c: ClassInfo) => {
            const occupancy = (c.currentCount / c.capacity) * 100;
            const occupancyColor = occupancy >= 90 ? 'bg-danger-500' : occupancy >= 70 ? 'bg-warning-500' : 'bg-success-500';
            const textColor = occupancy >= 90 ? 'text-danger-600' : occupancy >= 70 ? 'text-warning-600' : 'text-success-600';
            return (
              <div key={c.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.grade}</p>
                  </div>
                  <span className={`text-sm font-bold ${textColor}`}>
                    {Math.round(occupancy)}%
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-gray-800">{c.currentCount}</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-500">{c.capacity}人</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${occupancyColor} transition-all duration-300`}
                    style={{ width: `${Math.min(occupancy, 100)}%` }}
                  ></div>
                </div>
                {c.currentCount >= c.capacity && (
                  <p className="text-xs text-danger-500 mt-1">已满员</p>
                )}
                {c.currentCount < c.capacity && c.capacity - c.currentCount <= 2 && (
                  <p className="text-xs text-warning-500 mt-1">剩余{c.capacity - c.currentCount}个床位</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="搜索幼儿姓名/编号..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
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
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary flex items-center gap-1">
              <Filter size={16} />
              筛选
            </button>
            <button
              onClick={() => setAddModalOpen(true)}
              className="btn-primary flex items-center gap-1"
            >
              <Plus size={16} />
              新增幼儿
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 border-b border-gray-100">
          {[
            { key: 'all', label: '全部', count: stats.total },
            { key: 'in_school', label: '在园', count: stats.inSchool },
            { key: 'leave', label: '请假', count: stats.leave },
            { key: 'absent', label: '缺勤', count: stats.absent },
            { key: 'special', label: '特殊体质', count: stats.special },
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
              {tab.label} <span className="text-xs">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">幼儿信息</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">班级</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">床位</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">过敏/特殊体质</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">监护人</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredChildren.map(child => (
                <tr key={child.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full flex items-center justify-center">
                        <Baby className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{child.name}</p>
                        <p className="text-xs text-gray-500">{child.gender} · {child.age}岁 · {child.birthDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-700">{child.className}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Bed size={14} />
                      <span>{child.bedNumber || '-'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {child.allergies.length > 0 || child.specialConstitution.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {child.allergies.map(a => (
                          <span key={a} className="px-2 py-0.5 bg-danger-50 text-danger-600 rounded text-xs">
                            <AlertTriangle size={10} className="inline mr-0.5" />
                            {a}过敏
                          </span>
                        ))}
                        {child.specialConstitution.map(s => (
                          <span key={s} className="px-2 py-0.5 bg-warning-50 text-warning-600 rounded text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm text-gray-800">{child.guardianName}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone size={10} />
                        {child.guardianPhone}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(child.status)}
                  </td>
                  <td className="py-3 px-4">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical size={16} className="text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">共 {filteredChildren.length} 条记录</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded">上一页</button>
            <button className="px-3 py-1 text-sm bg-primary-500 text-white rounded">1</button>
            <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded">2</button>
            <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded">下一页</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">智能分班推荐</h3>
          <p className="text-sm text-gray-500 mb-4">根据幼儿年龄、特殊体质自动推荐班级和床位</p>
          <div className="space-y-3">
            {classes.map((cls: ClassInfo) => (
              <div key={cls.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{cls.name}</p>
                    <p className="text-xs text-gray-500">{cls.grade} · {cls.headTeacher} 带班</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">{cls.currentCount}/{cls.capacity}</p>
                    <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                      <div
                        className={`h-1.5 rounded-full ${
                          cls.currentCount >= cls.capacity ? 'bg-danger-500' :
                          cls.currentCount >= cls.capacity * 0.8 ? 'bg-warning-500' : 'bg-primary-500'
                        }`}
                        style={{ width: `${Math.min((cls.currentCount / cls.capacity) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">最近入托</h3>
          <div className="space-y-3">
            {children.slice(0, 5).map(child => (
              <div key={child.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full flex items-center justify-center">
                  <Baby className="text-white" size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{child.name}</p>
                  <p className="text-xs text-gray-500">{child.className} · 床位 {child.bedNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">入托日期</p>
                  <p className="text-xs text-gray-700 flex items-center gap-1">
                    <Calendar size={10} />
                    {child.enrollmentDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="新增幼儿入托"
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setAddModalOpen(false)} className="btn-secondary">
              取消
            </button>
            <button onClick={handleAddChild} className="btn-primary">
              确认入托
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">幼儿姓名 *</label>
              <input
                type="text"
                value={newChildForm.name}
                onChange={(e) => setNewChildForm({ ...newChildForm, name: e.target.value })}
                className="input-field"
                placeholder="请输入幼儿姓名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">性别 *</label>
              <div className="flex gap-2">
                {['男', '女'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setNewChildForm({ ...newChildForm, gender: g as '男' | '女' })}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                      newChildForm.gender === g
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">出生日期 *</label>
              <input
                type="date"
                value={newChildForm.birthDate}
                onChange={(e) => handleBirthDateChange(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">年龄</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                {newChildForm.age > 0 ? `${newChildForm.age} 岁` : '请选择出生日期'}
              </div>
            </div>
          </div>

          {showRecommendation && recommendedClass && (
            <div className="bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="text-primary-600" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-primary-800 mb-2">智能分配推荐</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">推荐班级：</span>
                      <span className="font-medium text-primary-700">{recommendedClass.className}</span>
                      <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded">
                        匹配度 {recommendedClass.confidence}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{recommendedClass.reason}</p>
                    {recommendedBed && (
                      <>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-gray-700">推荐床位：</span>
                          <span className="font-medium text-primary-700">{recommendedBed.bedNumber}</span>
                          <span className="text-xs text-gray-500">({recommendedBed.bedroom})</span>
                        </div>
                        <p className="text-xs text-gray-600">{recommendedBed.reason}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">过敏史（多个用逗号分隔）</label>
              <input
                type="text"
                value={newChildForm.allergies}
                onChange={(e) => handleAllergyChange(e.target.value)}
                className="input-field"
                placeholder="如：花生,牛奶,海鲜"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">特殊体质（多个用逗号分隔）</label>
              <input
                type="text"
                value={newChildForm.specialConstitution}
                onChange={(e) => handleSpecialConstitutionChange(e.target.value)}
                className="input-field"
                placeholder="如：哮喘,过敏性体质"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分配班级</label>
              <select
                value={newChildForm.className}
                onChange={(e) => setNewChildForm({ ...newChildForm, className: e.target.value })}
                className="select-field"
              >
                <option value="">请选择班级</option>
                {classes.map((c: ClassInfo) => (
                  <option key={c.id} value={c.name}>{c.name} ({c.grade})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分配床位</label>
              <input
                type="text"
                value={newChildForm.bedNumber}
                onChange={(e) => setNewChildForm({ ...newChildForm, bedNumber: e.target.value })}
                className="input-field"
                placeholder="如：A-01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">与监护人关系 *</label>
              <select
                value={newChildForm.guardianRelation}
                onChange={(e) => setNewChildForm({ ...newChildForm, guardianRelation: e.target.value })}
                className="select-field"
              >
                <option value="">请选择</option>
                <option value="父亲">父亲</option>
                <option value="母亲">母亲</option>
                <option value="祖父">祖父</option>
                <option value="祖母">祖母</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">监护人姓名 *</label>
              <input
                type="text"
                value={newChildForm.guardianName}
                onChange={(e) => setNewChildForm({ ...newChildForm, guardianName: e.target.value })}
                className="input-field"
                placeholder="请输入监护人姓名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">联系电话 *</label>
              <input
                type="tel"
                value={newChildForm.guardianPhone}
                onChange={(e) => setNewChildForm({ ...newChildForm, guardianPhone: e.target.value })}
                className="input-field"
                placeholder="请输入联系电话"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChildrenManagement;
