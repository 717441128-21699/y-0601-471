import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  ChefHat,
  Apple,
  Milk,
  Wheat,
  AlertTriangle,
  Plus,
  Settings,
  Info,
  TrendingUp,
  CheckCircle2,
  Package,
  X,
} from 'lucide-react';
import { recipes } from '../data/mockData';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';

const Recipe: React.FC = () => {
  const { inventoryItems, children, updateInventoryItemsBatch } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMeal, setSelectedMeal] = useState('all');
  const [activeTab, setActiveTab] = useState('today');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [executedDates, setExecutedDates] = useState<string[]>([]);
  const [showResultModal, setShowResultModal] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    consumed: { name: string; unit: string; quantity: number }[];
    lowStock: { name: string; unit: string; remain: number; minStock: number }[];
  }>({ consumed: [], lowStock: [] });

  const EXECUTED_DATES_KEY = 'recipe_executed_dates';

  useEffect(() => {
    const saved = localStorage.getItem(EXECUTED_DATES_KEY);
    if (saved) {
      try {
        setExecutedDates(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse executed dates', e);
      }
    }
  }, []);

  const isDateExecuted = useMemo(() => executedDates.includes(selectedDate), [executedDates, selectedDate]);

  const todayRecipes = recipes;

  const mealTypes = [
    { key: 'breakfast', label: '早餐', icon: <Milk size={16} /> },
    { key: 'snack_morning', label: '上午点心', icon: <Apple size={16} /> },
    { key: 'lunch', label: '午餐', icon: <ChefHat size={16} /> },
    { key: 'snack_afternoon', label: '下午点心', icon: <Apple size={16} /> },
    { key: 'dinner', label: '晚餐', icon: <Wheat size={16} /> },
  ];

  const getMealLabel = (type: string) => {
    const meal = mealTypes.find(m => m.key === type);
    return meal?.label || type;
  };

  const filteredRecipes = selectedMeal === 'all'
    ? todayRecipes
    : todayRecipes.filter(r => r.mealType === selectedMeal);

  const totalNutrition = {
    calories: todayRecipes.reduce((sum, r) => sum + r.nutritionFacts.calories, 0),
    protein: todayRecipes.reduce((sum, r) => sum + r.nutritionFacts.protein, 0),
    fat: todayRecipes.reduce((sum, r) => sum + r.nutritionFacts.fat, 0),
    carbs: todayRecipes.reduce((sum, r) => sum + r.nutritionFacts.carbs, 0),
  };

  const allergyChildren = useMemo(() => children.filter(c => c.allergies.length > 0), [children]);

  const requiredIngredients = useMemo(() => {
    const map = new Map<string, { name: string; unit: string; quantity: number }>();
    todayRecipes.forEach(recipe => {
      recipe.dishes.forEach(dish => {
        dish.ingredients.forEach(ing => {
          const key = `${ing.name}__${ing.unit}`;
          if (map.has(key)) {
            const existing = map.get(key)!;
            existing.quantity += ing.quantity * Math.max(1, Math.ceil(children.length / 10));
          } else {
            map.set(key, {
              name: ing.name,
              unit: ing.unit,
              quantity: ing.quantity * Math.max(1, Math.ceil(children.length / 10)),
            });
          }
        });
      });
    });
    return Array.from(map.values());
  }, [todayRecipes, children.length]);

  const handleConfirmExecute = () => {
    if (isDateExecuted) return;

    const updates: { itemId: string; updates: Partial<typeof inventoryItems[number]> }[] = [];
    const consumedItems: { name: string; unit: string; quantity: number }[] = [];
    const lowStockItems: { name: string; unit: string; remain: number; minStock: number }[] = [];

    requiredIngredients.forEach(req => {
      const matched = inventoryItems.find(inv =>
        inv.name === req.name && inv.unit === req.unit
      ) || inventoryItems.find(inv => inv.name === req.name);

      if (matched) {
        const newQty = Math.max(0, matched.quantity - req.quantity);
        updates.push({
          itemId: matched.id,
          updates: {
            quantity: newQty,
            status: newQty <= 0 ? 'out_of_stock' : newQty < matched.minStock ? 'low_stock' : 'normal',
          },
        });
        consumedItems.push(req);
        if (newQty < matched.minStock) {
          lowStockItems.push({ name: matched.name, unit: matched.unit, remain: newQty, minStock: matched.minStock });
        }
      }
    });

    if (updates.length > 0) {
      updateInventoryItemsBatch(updates);
    }

    const newExecutedDates = [...executedDates, selectedDate];
    setExecutedDates(newExecutedDates);
    localStorage.setItem(EXECUTED_DATES_KEY, JSON.stringify(newExecutedDates));

    setExecutionResult({ consumed: consumedItems, lowStock: lowStockItems });
    setShowConfirmModal(false);
    setShowResultModal(true);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <ChefHat className="text-orange-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">今日餐点数</p>
              <p className="text-xl font-bold text-gray-800">{todayRecipes.length}餐</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">今日总热量</p>
              <p className="text-xl font-bold text-gray-800">{totalNutrition.calories}kcal</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Apple className="text-blue-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">食材种类</p>
              <p className="text-xl font-bold text-gray-800">15+ 种</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">过敏幼儿</p>
              <p className="text-xl font-bold text-gray-800">{allergyChildren.length}人</p>
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
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field w-40"
              />
            </div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setSelectedMeal('all')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  selectedMeal === 'all'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                全部
              </button>
              {mealTypes.map(meal => (
                <button
                  key={meal.key}
                  onClick={() => setSelectedMeal(meal.key)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${
                    selectedMeal === meal.key
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {meal.icon}
                  {meal.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary flex items-center gap-1">
              <Settings size={16} />
              食谱配置
            </button>
            <button className="btn-primary flex items-center gap-1">
              <Plus size={16} />
              生成周食谱
            </button>
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isDateExecuted}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDateExecuted
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-success-500 hover:bg-success-600 text-white'
              }`}
            >
              {isDateExecuted ? <CheckCircle2 size={16} /> : <Package size={16} />}
              {isDateExecuted ? '已执行' : '确认食谱执行'}
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 border-b border-gray-100">
          {[
            { key: 'today', label: '今日食谱' },
            { key: 'week', label: '本周食谱' },
            { key: 'personalized', label: '个性化食谱' },
            { key: 'nutrition', label: '营养分析' },
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

        {activeTab === 'today' && (
          <div className="grid grid-cols-1 gap-4">
            {filteredRecipes.map(recipe => (
              <div key={recipe.id} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <ChefHat className="text-orange-500" size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{recipe.mealName}</h4>
                      <p className="text-xs text-gray-500">{getMealLabel(recipe.mealType)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">{recipe.nutritionFacts.calories} kcal</p>
                    <p className="text-xs text-gray-500">
                      蛋白质{recipe.nutritionFacts.protein}g · 脂肪{recipe.nutritionFacts.fat}g · 碳水{recipe.nutritionFacts.carbs}g
                    </p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-4 gap-4">
                    {recipe.dishes.map(dish => (
                      <div key={dish.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-800 text-sm">{dish.name}</p>
                          {dish.allergens.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-danger-100 text-danger-600 rounded text-xs">
                              含过敏原
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {dish.ingredients.map(ing => (
                            <div key={ing.id} className="flex items-center justify-between text-xs text-gray-500">
                              <span>{ing.name}</span>
                              <span>{ing.quantity}{ing.unit}</span>
                            </div>
                          ))}
                        </div>
                        {dish.allergens.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs text-danger-600 flex items-center gap-1">
                              <AlertTriangle size={12} />
                              过敏原: {dish.allergens.join('、')}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">维生素含量</p>
                    <div className="flex flex-wrap gap-2">
                      {recipe.nutritionFacts.vitamins.map(v => (
                        <span key={v} className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'personalized' && (
          <div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-yellow-800">个性化食谱配置</p>
                  <p className="text-sm text-yellow-600 mt-1">
                    系统自动根据幼儿过敏史和特殊体质生成个性化餐食方案，共 {allergyChildren.length} 名幼儿需要特殊配餐
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {allergyChildren.map(child => (
                <div key={child.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{child.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{child.name}</p>
                        <p className="text-xs text-gray-500">{child.className}</p>
                      </div>
                    </div>
                    <button className="text-sm text-primary-500 hover:text-primary-600">
                      查看详情
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {child.allergies.map(a => (
                      <span key={a} className="px-2 py-1 bg-danger-50 text-danger-600 rounded text-xs">
                        {a}过敏
                      </span>
                    ))}
                    {child.specialConstitution.map(s => (
                      <span key={s} className="px-2 py-1 bg-warning-50 text-warning-600 rounded text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-2">今日替代方案</p>
                    <p className="text-sm text-gray-700">
                      牛奶 → 豆奶 ｜ 鸡蛋 → 鹌鹑蛋 ｜ 花生 → 瓜子仁
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-blue-600">{totalNutrition.calories}</p>
                <p className="text-sm text-blue-500 mt-1">热量 (kcal)</p>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-xs text-blue-400 mt-1">推荐标准的 75%</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-green-600">{totalNutrition.protein}g</p>
                <p className="text-sm text-green-500 mt-1">蛋白质</p>
                <div className="w-full bg-green-200 rounded-full h-2 mt-3">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs text-green-400 mt-1">推荐标准的 85%</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-yellow-600">{totalNutrition.fat}g</p>
                <p className="text-sm text-yellow-600 mt-1">脂肪</p>
                <div className="w-full bg-yellow-200 rounded-full h-2 mt-3">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <p className="text-xs text-yellow-500 mt-1">推荐标准的 60%</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-purple-600">{totalNutrition.carbs}g</p>
                <p className="text-sm text-purple-500 mt-1">碳水化合物</p>
                <div className="w-full bg-purple-200 rounded-full h-2 mt-3">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <p className="text-xs text-purple-400 mt-1">推荐标准的 70%</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-blue-800">营养配餐原则</p>
                  <ul className="text-sm text-blue-600 mt-1 space-y-1">
                    <li>• 遵循《学生餐营养指南》标准，保障幼儿生长发育需求</li>
                    <li>• 荤素搭配、粗细搭配，保证食物多样性</li>
                    <li>• 早餐吃好、午餐吃饱、晚餐吃少的原则</li>
                    <li>• 每周菜品不重复，满足幼儿口味需求</li>
                    <li>• 特殊体质幼儿提供个性化替代方案</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">今日食材消耗与库存</h3>
        {isDateExecuted && (
          <div className="mb-4 p-3 bg-success-50 border border-success-200 rounded-lg flex items-center gap-2 text-sm text-success-700">
            <CheckCircle2 size={16} />
            {selectedDate} 的食谱已执行，库存已自动扣减
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">食材名称</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">分类</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">当前库存</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">今日用量</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">安全库存</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
              </tr>
            </thead>
            <tbody>
              {requiredIngredients.map((req, idx) => {
                const matched = inventoryItems.find(inv =>
                  inv.name === req.name && inv.unit === req.unit
                ) || inventoryItems.find(inv => inv.name === req.name);
                if (!matched) return null;
                return (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-800">{matched.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{matched.category}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{matched.quantity} {matched.unit}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {req.quantity} {req.unit}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{matched.minStock} {matched.unit}</td>
                    <td className="py-3 px-4">
                      <span className={`status-badge ${
                        matched.status === 'normal' ? 'bg-success-100 text-success-600' :
                        matched.status === 'low_stock' ? 'bg-warning-100 text-warning-600' :
                        'bg-danger-100 text-danger-600'
                      }`}>
                        {matched.status === 'normal' ? '正常' : matched.status === 'low_stock' ? '库存不足' : '缺货'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="确认执行食谱"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">即将执行 {selectedDate} 的所有食谱</p>
                <p>系统将自动扣减 {requiredIngredients.length} 种食材的库存，扣减后低于安全线的食材会生成补货提醒。</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">将扣减以下食材：</p>
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">食材</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">扣减量</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">当前库存</th>
                  </tr>
                </thead>
                <tbody>
                  {requiredIngredients.map((req, idx) => {
                    const matched = inventoryItems.find(inv =>
                      inv.name === req.name && inv.unit === req.unit
                    ) || inventoryItems.find(inv => inv.name === req.name);
                    return (
                      <tr key={idx} className="border-t border-gray-100">
                        <td className="py-2 px-3 text-gray-800">{req.name}</td>
                        <td className="py-2 px-3 text-gray-700">{req.quantity} {req.unit}</td>
                        <td className="py-2 px-3 text-gray-500">
                          {matched ? `${matched.quantity} ${matched.unit}` : '未入库'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleConfirmExecute}
              className="btn-primary bg-success-500 hover:bg-success-600"
            >
              确认执行并扣减库存
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title="食谱执行完成"
      >
        <div className="space-y-4">
          <div className="bg-success-50 border border-success-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle2 className="text-success-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-success-700">
              <p className="font-medium">库存扣减成功</p>
              <p>已扣减 {executionResult.consumed.length} 种食材，{selectedDate} 已标记为已执行。</p>
            </div>
          </div>
          {executionResult.lowStock.length > 0 && (
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-warning-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-warning-800 mb-2">补货提醒：{executionResult.lowStock.length} 种食材库存不足</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {executionResult.lowStock.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm text-warning-700 bg-white/60 rounded px-3 py-1.5">
                        <span>{item.name}</span>
                        <span>剩余 {item.remain}{item.unit} / 安全线 {item.minStock}{item.unit}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-warning-600 mt-2">请到库存管理模块处理补货，或在待办中心查看。</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              onClick={() => setShowResultModal(false)}
              className="btn-primary"
            >
              我知道了
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Recipe;
