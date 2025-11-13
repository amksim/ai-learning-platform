"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Plus, Trash2, Edit, Save, X, ArrowUp, ArrowDown, Sparkles, Code, Lock, TrendingUp, Settings, Terminal, Database, Zap, Trophy, Rocket, CheckCircle, Users, User } from "lucide-react";
import { allCourseLevels, Level, freeLessonsCount } from "@/lib/courseLevels";
import { useAuth } from "@/contexts/AuthContext";
import { autoTranslateCourseContent } from "@/lib/translateContent";
import ImageUploader from "@/components/admin/ImageUploader";

// Available icons
const iconOptions = [
  { name: 'Sparkles', component: Sparkles },
  { name: 'Code', component: Code },
  { name: 'Lock', component: Lock },
  { name: 'TrendingUp', component: TrendingUp },
  { name: 'Settings', component: Settings },
  { name: 'Terminal', component: Terminal },
  { name: 'Database', component: Database },
  { name: 'Zap', component: Zap },
  { name: 'Trophy', component: Trophy },
  { name: 'Rocket', component: Rocket },
  { name: 'CheckCircle', component: CheckCircle }
];

// Convert icon component to string name for localStorage
const getIconName = (icon: any): string => {
  if (typeof icon === 'string') return icon;
  if (typeof icon === 'function') {
    const name = icon.displayName || icon.name;
    return name || 'Sparkles';
  }
  return 'Sparkles';
};

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [levels, setLevels] = useState<Level[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Level>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [insertAfter, setInsertAfter] = useState<number | null>(null);
  const [newTopic, setNewTopic] = useState("");
  const [stats, setStats] = useState({ totalUsers: 147, activeStudents: 89 });
  const [isEditingStats, setIsEditingStats] = useState(false);

  // Admin access protection
  useEffect(() => {
    // Не проверяем пока загружается
    if (loading) return;
    
    if (!user) {
      router.push("/login");
      return;
    }
    
    if (user.email?.toLowerCase() !== "kmak4551@gmail.com") {
      router.push("/");
      return;
    }
  }, [user, loading, router]);

  // Load courses from API
  const loadCourses = async () => {
    try {
      console.log('📡 Loading courses from API...');
      const response = await fetch('/api/courses');
      const data = await response.json();
      
      if (data.courses) {
        console.log('✅ Loaded', data.courses.length, 'courses');
        const formattedCourses = data.courses.map((course: any) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          difficulty: course.difficulty,
          topics: course.topics || [],
          category: course.category,
          icon: course.icon,
          blockName: course.block_name,
          practice: course.practice || false,
          practiceDescription: course.practice_description,
          isFree: course.is_free || false,
          translations: course.translations || {},
          images: course.images || [],
          displayOrder: course.display_order || course.id
        }));
        
        // СОРТИРОВКА: По display_order (порядок который ты выбрал)
        // Бесплатные и платные могут быть в ЛЮБОМ порядке
        const sortedCourses = formattedCourses.sort((a: any, b: any) => {
          return a.displayOrder - b.displayOrder;
        });
        
        setLevels(sortedCourses);
        
        // Если база пустая - показываем пустой список, НЕ дефолтные курсы
        if (data.courses.length === 0) {
          console.log('ℹ️ Database is empty - ready to add courses!');
        }
      } else {
        console.log('⚠️ No courses data, showing empty list');
        setLevels([]);
      }
    } catch (error) {
      console.error('❌ Error loading courses:', error);
      setLevels([]);
    }
  };

  useEffect(() => {
    loadCourses();
    loadStats();
  }, []);

  // Загрузка статистики
  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Обновление статистики
  const updateStats = async () => {
    try {
      const response = await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats)
      });
      
      if (response.ok) {
        alert('✅ Статистика обновлена!');
        setIsEditingStats(false);
        loadStats();
      }
    } catch (error) {
      console.error('Failed to update stats:', error);
      alert('❌ Ошибка при обновлении статистики');
    }
  };

  // Trigger refresh on courses page
  const triggerRefresh = () => {
    window.dispatchEvent(new CustomEvent('courseLevelsUpdated'));
  };

  const renumberLevels = (levelsArray: Level[]) => {
    return levelsArray.map((level, index) => ({
      ...level,
      id: index + 1
    }));
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Удалить урок ${id}?`)) return;
    
    try {
      const response = await fetch(`/api/courses?id=${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('✅ Урок удалён!');
        loadCourses();
        triggerRefresh();
      } else {
        const error = await response.json();
        alert(`❌ Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Ошибка при удалении');
    }
  };

  const handleEdit = (level: Level) => {
    setEditingId(level.id);
    setEditForm(level);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    
    try {
      const updateData = {
        id: editingId,
        title: editForm.title,
        description: editForm.description,
        difficulty: editForm.difficulty,
        topics: editForm.topics || [],
        category: editForm.category,
        icon: editForm.icon,
        block_name: editForm.blockName,
        practice: editForm.practice || false,
        practice_description: editForm.practiceDescription,
        is_free: editForm.isFree || false,
        images: editForm.images || [],
        translations: autoTranslateCourseContent(editForm.title || '', editForm.description || '')
      };
      
      const response = await fetch('/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        alert('✅ Урок обновлён!');
        loadCourses();
        triggerRefresh();
        setEditingId(null);
        setEditForm({});
      } else {
        const error = await response.json();
        alert(`❌ Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('❌ Ошибка при обновлении');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleInsert = (afterId: number) => {
    setInsertAfter(afterId);
    setShowAddForm(true);
    
    // Find the lesson we're inserting after and copy its category and blockName
    const previousLesson = levels.find(l => l.id === afterId);
    
    setEditForm({
      title: "",
      description: "",
      difficulty: previousLesson?.difficulty || "beginner",
      topics: [],
      category: previousLesson?.category || "foundation",
      icon: previousLesson?.icon || 'Sparkles',
      practice: false,
      practiceDescription: "",
      isFree: previousLesson?.isFree || false,
      blockName: previousLesson?.blockName || "", // Copy blockName to keep in same category
      images: []
    });
  };

  const handleAdd = async () => {
    if (!editForm.title || !editForm.description) {
      alert("Заполните название и описание урока");
      return;
    }

    try {
      // Определяем display_order
      let displayOrder = levels.length + 1;
      
      if (insertAfter !== null) {
        // Находим урок после которого вставляем
        const afterLesson = levels.find(l => l.id === insertAfter);
        if (afterLesson && afterLesson.displayOrder) {
          displayOrder = afterLesson.displayOrder + 1;
          
          // ВАЖНО! Сдвигаем все последующие уроки на +1
          // Это предотвращает конфликты display_order
          const lessonsToUpdate = levels.filter(l => (l.displayOrder ?? 0) >= displayOrder);
          
          for (const lesson of lessonsToUpdate) {
            await fetch('/api/courses', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: lesson.id,
                display_order: (lesson.displayOrder ?? 0) + 1
              })
            });
          }
        }
      }
      
      const newCourse = {
        title: editForm.title || "",
        description: editForm.description || "",
        difficulty: editForm.difficulty || "beginner",
        topics: editForm.topics || [],
        category: editForm.category || "foundation",
        icon: editForm.icon || 'Sparkles',
        block_name: editForm.blockName,
        practice: editForm.practice || false,
        practice_description: editForm.practiceDescription || "",
        is_free: editForm.isFree || false,
        images: editForm.images || [],
        display_order: displayOrder,
        translations: autoTranslateCourseContent(editForm.title || '', editForm.description || '')
      };
      
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse)
      });
      
      if (response.ok) {
        alert('✅ Новый урок добавлен!');
        loadCourses();
        triggerRefresh();
        setShowAddForm(false);
        setInsertAfter(null);
        setEditForm({});
      } else {
        const error = await response.json();
        alert(`❌ Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Add error:', error);
      alert('❌ Ошибка при добавлении');
    }
  };

  const handleMoveUp = async (id: number) => {
    const index = levels.findIndex(l => l.id === id);
    if (index <= 0) return;
    
    try {
      // Меняем display_order у двух курсов
      const current = levels[index];
      const previous = levels[index - 1];
      
      await fetch('/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: current.id, display_order: index })
      });
      
      await fetch('/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: previous.id, display_order: index + 1 })
      });
      
      loadCourses();
      triggerRefresh();
    } catch (error) {
      console.error('Move error:', error);
    }
  };

  const handleMoveDown = async (id: number) => {
    const index = levels.findIndex(l => l.id === id);
    if (index >= levels.length - 1) return;
    
    try {
      const current = levels[index];
      const next = levels[index + 1];
      
      await fetch('/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: current.id, display_order: index + 2 })
      });
      
      await fetch('/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: next.id, display_order: index + 1 })
      });
      
      loadCourses();
      triggerRefresh();
    } catch (error) {
      console.error('Move error:', error);
    }
  };

  const addTopic = () => {
    if (!newTopic.trim()) return;
    setEditForm({ 
      ...editForm, 
      topics: [...(editForm.topics || []), newTopic.trim()] 
    });
    setNewTopic("");
  };

  const removeTopic = (index: number) => {
    const topics = editForm.topics || [];
    setEditForm({ 
      ...editForm, 
      topics: topics.filter((_, i) => i !== index) 
    });
  };

  const IconComponent = iconOptions.find(opt => opt.name === editForm.icon)?.component || Sparkles;

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not admin
  if (!user || user.email?.toLowerCase() !== "kmak4551@gmail.com") {
    return null;
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Админ-панель курса
            </span>
          </h1>

          {/* Управление статистикой */}
          <Card className="mb-6 glass border-2 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Статистика платформы
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditingStats ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Всего пользователей</label>
                    <input
                      type="number"
                      value={stats.totalUsers}
                      onChange={(e) => setStats({...stats, totalUsers: Number(e.target.value)})}
                      className="w-full px-4 py-2 rounded-lg bg-gray-800 border-2 border-gray-700 focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Учатся сейчас</label>
                    <input
                      type="number"
                      value={stats.activeStudents}
                      onChange={(e) => setStats({...stats, activeStudents: Number(e.target.value)})}
                      className="w-full px-4 py-2 rounded-lg bg-gray-800 border-2 border-gray-700 focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={updateStats}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Сохранить
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingStats(false);
                        loadStats();
                      }}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Всего пользователей</p>
                      <p className="text-3xl font-bold text-blue-400">{stats.totalUsers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Учатся сейчас</p>
                      <p className="text-3xl font-bold text-green-400">{stats.activeStudents}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditingStats(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Изменить
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                setShowAddForm(true);
                setInsertAfter(null);
                setEditForm({
                  title: "",
                  description: "",
                  difficulty: "beginner",
                  topics: [],
                  category: "foundation",
                  icon: 'Sparkles',
                  practice: false,
                  practiceDescription: "",
                  isFree: false, // По умолчанию платный, но можно изменить галочкой
                  images: []
                });
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
            >
              <Plus className="h-5 w-5" />
              Добавить урок
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingId) && (
          <Card className="glass premium-shadow border-2 border-purple-400 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {insertAfter !== null 
                    ? `Вставить урок после ${insertAfter}`
                    : editingId 
                    ? `Редактировать урок ${editingId}`
                    : "Добавить новый урок"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-purple-400">Название *</label>
                  <input
                    type="text"
                    value={editForm.title || ""}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border-2 border-gray-700 focus:border-purple-500 text-white transition-all"
                    placeholder="Название урока"
                  />
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-purple-400">Описание *</label>
                  <textarea
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border-2 border-gray-700 focus:border-purple-500 text-white h-32 transition-all"
                    placeholder="Описание урока"
                  />
                </div>

                {/* Difficulty and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-purple-400">Сложность</label>
                    <select
                      value={editForm.difficulty || "beginner"}
                      onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border-2 border-gray-700 focus:border-purple-500 text-white transition-all"
                    >
                      <option value="beginner">🟢 Начальный</option>
                      <option value="intermediate">🟡 Средний</option>
                      <option value="advanced">🔴 Продвинутый</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-purple-400">Категория</label>
                    <select
                      value={editForm.category || "foundation"}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border-2 border-gray-700 focus:border-purple-500 text-white transition-all"
                    >
                      <option value="foundation">🏗️ Foundation</option>
                      <option value="html">🌐 HTML</option>
                      <option value="css">🎨 CSS</option>
                      <option value="javascript">⚡ JavaScript</option>
                      <option value="typescript">💎 TypeScript</option>
                      <option value="react">⚛️ React</option>
                      <option value="nextjs">▲ Next.js</option>
                      <option value="nodejs">🟢 Node.js</option>
                      <option value="databases">🗄️ Databases</option>
                      <option value="games">🎮 Games</option>
                      <option value="apis">🔌 APIs</option>
                      <option value="deployment">🚀 Deployment</option>
                      <option value="advanced">🔥 Advanced</option>
                      <option value="practice">✍️ Practice</option>
                    </select>
                  </div>
                </div>

                {/* Icon Selector */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-purple-400">Иконка</label>
                  <div className="grid grid-cols-6 md:grid-cols-11 gap-2">
                    {iconOptions.map((iconOpt) => {
                      const Icon = iconOpt.component;
                      return (
                        <button
                          key={iconOpt.name}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, icon: iconOpt.name })}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            editForm.icon === iconOpt.name
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-gray-700 bg-gray-800/50 hover:border-purple-400'
                          }`}
                          title={iconOpt.name}
                        >
                          <Icon className="h-6 w-6 mx-auto" />
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Выбрано: <IconComponent className="h-4 w-4 inline" /> {editForm.icon}
                  </p>
                </div>

                {/* Block Name */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-purple-400">Название блока (опционально)</label>
                  <input
                    type="text"
                    value={editForm.blockName || ""}
                    onChange={(e) => setEditForm({ ...editForm, blockName: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border-2 border-gray-700 focus:border-purple-500 text-white transition-all"
                    placeholder="🚀 Название блока"
                  />
                  <p className="text-sm text-gray-400 mt-1">Если указано, этот урок начнет новый раздел</p>
                </div>

                {/* Topics */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-purple-400">Темы урока</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                      className="flex-1 px-4 py-2 rounded-lg bg-gray-800/50 border-2 border-gray-700 focus:border-purple-500 text-white transition-all"
                      placeholder="Добавить тему"
                    />
                    <button
                      type="button"
                      onClick={addTopic}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition-all"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(editForm.topics || []).map((topic, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-700 rounded-full text-sm flex items-center gap-2"
                      >
                        {topic}
                        <button
                          type="button"
                          onClick={() => removeTopic(index)}
                          className="text-red-400 hover:text-red-300 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Practice Toggle */}
                <div className="border-2 border-blue-500/30 rounded-lg p-4 bg-blue-500/5">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="practice"
                      checked={editForm.practice || false}
                      onChange={(e) => setEditForm({ ...editForm, practice: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-blue-500 bg-gray-800"
                    />
                    <label htmlFor="practice" className="text-lg font-bold text-blue-400 cursor-pointer">
                      ✍️ Практическое задание
                    </label>
                  </div>
                  
                  {editForm.practice && (
                    <div>
                      <label className="block text-sm font-bold mb-2 text-blue-400">Описание практики</label>
                      <textarea
                        value={editForm.practiceDescription || ""}
                        onChange={(e) => setEditForm({ ...editForm, practiceDescription: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border-2 border-blue-700 focus:border-blue-500 text-white h-24 transition-all"
                        placeholder="Что нужно сделать в практическом задании?"
                      />
                    </div>
                  )}
                </div>

                {/* Free Lesson Toggle */}
                <div className="border-2 border-purple-500/30 rounded-lg p-4 bg-purple-500/5">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="isFree"
                      checked={editForm.isFree || false}
                      onChange={(e) => setEditForm({ ...editForm, isFree: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-purple-500 bg-gray-800"
                    />
                    <label htmlFor="isFree" className="text-lg font-bold text-purple-400 cursor-pointer">
                      🎁 Бесплатный урок
                    </label>
                  </div>
                  <p className="text-sm text-gray-400">
                    Бесплатные уроки доступны без регистрации и оплаты. 
                    Ты решаешь сколько сделать бесплатных.
                  </p>
                </div>

                {/* Images */}
                <div className="border-2 border-blue-500/30 rounded-lg p-4 bg-blue-500/5">
                  <ImageUploader
                    images={editForm.images || []}
                    onChange={(images) => setEditForm({ ...editForm, images })}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={editingId ? handleSaveEdit : handleAdd}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Save className="h-5 w-5" />
                    Сохранить
                  </button>
                  <button
                    onClick={() => {
                      if (editingId) {
                        handleCancelEdit();
                      } else {
                        setShowAddForm(false);
                        setInsertAfter(null);
                        setEditForm({});
                      }
                    }}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold flex items-center gap-2 transition-all"
                  >
                    <X className="h-5 w-5" />
                    Отмена
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Levels List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4 flex items-center justify-between">
            <span>Все уроки ({levels.length})</span>
            <div className="flex gap-4 text-sm">
              <span className="text-purple-400">
                🎁 Бесплатных: {levels.filter(l => l.isFree).length}
              </span>
              <span className="text-blue-400">
                ✍️ Практика: {levels.filter(l => l.practice).length}
              </span>
            </div>
          </h2>
          
          {levels.map((level, index) => {
            const LevelIcon = iconOptions.find(opt => opt.name === level.icon)?.component || Sparkles;
            
            // Показываем разделитель между бесплатными и платными
            const prevLevel = index > 0 ? levels[index - 1] : null;
            const showDivider = prevLevel && prevLevel.isFree && !level.isFree;
            
            return (
              <div key={level.id}>
                {/* Разделитель между бесплатными и платными */}
                {showDivider && (
                  <div className="mb-8 mt-8">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                      <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass border-2 border-blue-500 premium-shadow">
                        <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                          💎 Премиум уроки
                        </span>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                    </div>
                  </div>
                )}
                
                {level.blockName && (
                  <div className="mb-4 mt-8">
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass border-2 border-purple-400 premium-shadow">
                      <span className="text-lg font-bold text-purple-400">
                        {level.blockName}
                      </span>
                    </div>
                  </div>
                )}
                
                <Card className={`glass border-2 transition-all ${
                  level.practice ? 'border-blue-500/50 bg-blue-500/5' : 'border-gray-600'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Icon */}
                        <div className={`p-3 rounded-lg ${
                          level.practice ? 'bg-blue-600/20 border-2 border-blue-500' : 'bg-purple-600/20 border-2 border-purple-500'
                        }`}>
                          <LevelIcon className="h-6 w-6" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="text-2xl font-bold text-purple-400">
                              #{index + 1}
                            </span>
                            <h3 className="text-xl font-bold">{level.title}</h3>
                            {level.practice && (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500">
                                ✍️ Практика
                              </span>
                            )}
                            {level.isFree && (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500">
                                🎁 Бесплатный
                              </span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              level.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400 border border-green-500' :
                              level.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500' :
                              'bg-red-500/20 text-red-400 border border-red-500'
                            }`}>
                              {level.difficulty === 'beginner' ? '🟢' : level.difficulty === 'intermediate' ? '🟡' : '🔴'} {level.difficulty}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500">
                              {level.category}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                            {level.description}
                          </p>
                          {level.topics && level.topics.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {level.topics.map((topic, i) => (
                                <span key={i} className="px-2 py-1 rounded bg-gray-700/50 text-xs border border-gray-600">
                                  {topic}
                                </span>
                              ))}
                            </div>
                          )}
                          {level.practice && level.practiceDescription && (
                            <div className="mt-2 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                              <p className="text-sm text-blue-300">
                                <strong>Практика:</strong> {level.practiceDescription}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleMoveUp(level.id)}
                            disabled={index === 0}
                            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Переместить вверх"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(level.id)}
                            disabled={index === levels.length - 1}
                            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Переместить вниз"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(level)}
                            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all"
                            title="Редактировать"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(level.id)}
                            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition-all"
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleInsert(level.id)}
                          className="p-2 rounded-lg bg-green-600 hover:bg-green-700 w-full transition-all"
                          title="Вставить урок после этого"
                        >
                          <Plus className="h-4 w-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
