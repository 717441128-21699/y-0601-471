import React, { useState } from 'react';
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
} from 'lucide-react';
import { recipes, inventoryItems, children } from '../data/mockData';

const Recipe: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMeal, setSelectedMeal] = useState('all');
  const [activeTab, setActiveTab] = useState('today');

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

  const allergyChildren = children.filter(c => c.allergies.length > 0);

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
        <h3 className="font-semibold text-gray-800 mb-4">关联库存情况</h3>
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
              {inventoryItems.slice(0, 8).map(item => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-800">{item.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{item.category}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{item.quantity} {item.unit}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {Math.floor(item.quantity * 0.05)} {item.unit}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{item.minStock} {item.unit}</td>
                  <td className="py-3 px-4">
                    <span className={`status-badge ${
                      item.status === 'normal' ? 'bg-success-100 text-success-600' :
                      item.status === 'low_stock' ? 'bg-warning-100 text-warning-600' :
                      'bg-danger-100 text-danger-600'
                    }`}>
                      {item.status === 'normal' ? '正常' : item.status === 'low_stock' ? '库存不足' : '缺货'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Recipe;
