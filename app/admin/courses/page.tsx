'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Plus, Edit2, Trash2, Save, X, Loader2 } from 'lucide-react';

interface Course {
  id?: number;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  category: string;
  icon: string;
  block_name: string;
  practice: boolean;
  practice_description: string;
  is_free: boolean;
  display_order: number;
}

const EMPTY_COURSE: Course = {
  title: '',
  description: '',
  difficulty: 'beginner',
  topics: [],
  category: '',
  icon: '📚',
  block_name: '',
  practice: false,
  practice_description: '',
  is_free: false,
  display_order: 1,
};

export default function AdminCoursesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [editForm, setEditForm] = useState<Course>(EMPTY_COURSE);
  const [isSaving, setIsSaving] = useState(false);
  const [topicsInput, setTopicsInput] = useState('');

  // Проверка что пользователь админ
  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  useEffect(() => {
    if (loading) return;
    
    if (!user || !isAdmin) {
      router.push('/');
      return;
    }

    fetchCourses();
  }, [user, loading, isAdmin, router]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingId(course.id || null);
    setEditForm(course);
    setTopicsInput(course.topics.join(', '));
  };

  const handleNew = () => {
    setEditingId('new');
    setEditForm({ ...EMPTY_COURSE, display_order: courses.length + 1 });
    setTopicsInput('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(EMPTY_COURSE);
    setTopicsInput('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const courseData = {
        ...editForm,
        topics: topicsInput.split(',').map(t => t.trim()).filter(t => t),
      };

      const url = editingId === 'new' 
        ? '/api/admin/courses' 
        : `/api/admin/courses/${editingId}`;
      
      const method = editingId === 'new' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        await fetchCourses();
        handleCancel();
      } else {
        alert('Failed to save course');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Error saving course');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCourses();
      } else {
        alert('Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Error deleting course');
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">📚 Управление курсами</h1>
          <button
            onClick={handleNew}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold transition-all"
          >
            <Plus className="h-5 w-5" />
            Новый урок
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-sm">
            📊 Всего уроков: <strong>{courses.length}</strong> | 
            🆓 Бесплатных: <strong>{courses.filter(c => c.is_free).length}</strong> | 
            💰 Платных: <strong>{courses.filter(c => !c.is_free).length}</strong>
          </p>
        </div>

        {/* Форма редактирования */}
        {editingId && (
          <Card className="mb-8 bg-gray-800 border-2 border-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingId === 'new' ? 'Новый урок' : 'Редактирование урока'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-gray-300 mb-2">Название урока</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                    placeholder="Урок 1: Введение в AI"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-300 mb-2">Описание</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none h-24"
                    placeholder="Подробное описание урока..."
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Сложность</label>
                  <select
                    value={editForm.difficulty}
                    onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value as any })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Категория</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                    placeholder="Websites, Apps, Games..."
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Иконка (emoji)</label>
                  <input
                    type="text"
                    value={editForm.icon}
                    onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                    placeholder="📚 🎮 💻"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Номер урока</label>
                  <input
                    type="number"
                    value={editForm.display_order}
                    onChange={(e) => setEditForm({ ...editForm, display_order: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-300 mb-2">Темы (через запятую)</label>
                  <input
                    type="text"
                    value={topicsInput}
                    onChange={(e) => setTopicsInput(e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                    placeholder="AI basics, ChatGPT, Coding"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Блок</label>
                  <input
                    type="text"
                    value={editForm.block_name}
                    onChange={(e) => setEditForm({ ...editForm, block_name: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                    placeholder="Модуль 1: Основы"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.is_free}
                      onChange={(e) => setEditForm({ ...editForm, is_free: e.target.checked })}
                      className="w-5 h-5"
                    />
                    Бесплатный урок
                  </label>

                  <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.practice}
                      onChange={(e) => setEditForm({ ...editForm, practice: e.target.checked })}
                      className="w-5 h-5"
                    />
                    Практика
                  </label>
                </div>

                {editForm.practice && (
                  <div className="col-span-2">
                    <label className="block text-gray-300 mb-2">Описание практики</label>
                    <textarea
                      value={editForm.practice_description}
                      onChange={(e) => setEditForm({ ...editForm, practice_description: e.target.value })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none h-20"
                      placeholder="Что студент будет делать..."
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-all"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Сохранить
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
                >
                  Отмена
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Список курсов */}
        <div className="grid gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="bg-gray-800 border border-gray-700 hover:border-purple-500 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{course.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold text-white">{course.title}</h3>
                        <p className="text-sm text-gray-400">
                          #{course.display_order} | {course.category} | {course.difficulty}
                          {course.is_free && <span className="ml-2 text-green-400 font-bold">🆓 FREE</span>}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-2">{course.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {course.topics.map((topic, idx) => (
                        <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(course)}
                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => course.id && handleDelete(course.id)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {courses.length === 0 && !editingId && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">Нет уроков</p>
            <button
              onClick={handleNew}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold transition-all"
            >
              Создать первый урок
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
