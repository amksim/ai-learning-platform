"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Video, Check, X, ExternalLink, ArrowLeft, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PromoVideo {
  id: string;
  user_email: string;
  video_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
}

export default function PromoAdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [videos, setVideos] = useState<PromoVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  // Admin access protection
  useEffect(() => {
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

  // Load videos
  useEffect(() => {
    loadVideos();
  }, [statusFilter]);

  const loadVideos = async () => {
    setLoadingVideos(true);
    try {
      const response = await fetch(`/api/promo-video?status=${statusFilter}`);
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (error) {
      console.error('Error loading videos:', error);
    }
    setLoadingVideos(false);
  };

  const handleApprove = async (video: PromoVideo) => {
    setProcessing(video.id);
    try {
      const response = await fetch('/api/promo-video', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: video.id,
          status: 'approved',
          userEmail: video.user_email
        })
      });

      if (response.ok) {
        alert(`✅ Видео одобрено! Скидка предоставлена: ${video.user_email}`);
        loadVideos();
      } else {
        alert('❌ Ошибка при одобрении');
      }
    } catch (error) {
      alert('❌ Ошибка при одобрении');
    }
    setProcessing(null);
  };

  const handleReject = async (video: PromoVideo) => {
    setProcessing(video.id);
    try {
      const response = await fetch('/api/promo-video', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: video.id,
          status: 'rejected',
          userEmail: video.user_email
        })
      });

      if (response.ok) {
        alert('❌ Видео отклонено');
        loadVideos();
      } else {
        alert('Ошибка при отклонении');
      }
    } catch (error) {
      alert('Ошибка при отклонении');
    }
    setProcessing(null);
  };

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

  if (!user || user.email?.toLowerCase() !== "kmak4551@gmail.com") {
    return null;
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-background to-purple-500/5">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/admin"
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              🎬 Промо-видео
            </h1>
            <p className="text-gray-400">Проверка видео для скидки $179</p>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mb-6">
          {['pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === status
                  ? status === 'pending' 
                    ? 'bg-yellow-500 text-black'
                    : status === 'approved'
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {status === 'pending' && '⏳ Ожидают'}
              {status === 'approved' && '✅ Одобрены'}
              {status === 'rejected' && '❌ Отклонены'}
            </button>
          ))}
        </div>

        {/* Videos List */}
        {loadingVideos ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : videos.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="py-12 text-center">
              <Video className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                {statusFilter === 'pending' 
                  ? 'Нет видео на проверке'
                  : statusFilter === 'approved'
                    ? 'Нет одобренных видео'
                    : 'Нет отклонённых видео'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {videos.map((video) => (
              <Card key={video.id} className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Video className="h-5 w-5 text-purple-400" />
                        <span className="font-medium text-white">{video.user_email}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          video.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          video.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {video.status === 'pending' && '⏳ Ожидает'}
                          {video.status === 'approved' && '✅ Одобрено'}
                          {video.status === 'rejected' && '❌ Отклонено'}
                        </span>
                      </div>
                      
                      <a
                        href={video.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-2 mb-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {video.video_url}
                      </a>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {new Date(video.created_at).toLocaleString('ru-RU')}
                      </div>
                    </div>

                    {video.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(video)}
                          disabled={processing === video.id}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                        >
                          {processing === video.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          Одобрить
                        </button>
                        <button
                          onClick={() => handleReject(video)}
                          disabled={processing === video.id}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                        >
                          <X className="h-4 w-4" />
                          Отклонить
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
