'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, ArrowLeft, Share2, User } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import apiService from '@/lib/api';

interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  image_url?: string;
  priority: string;
  published_date: string;
  expiry_date?: string | null;
  is_featured: boolean;
  status: 'published' | 'draft';
  view_count?: number;
  author_name?: string | null;
  created: string;
  modified: string;
}

export default function AnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [announcementItem, setAnnouncementItem] = useState<AnnouncementItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
      const numericId = Number(rawId);
      if (!Number.isNaN(numericId)) {
        fetchAnnouncementItem(numericId);
      } else {
        console.error('[announcements] invalid id param', params.id);
        setLoading(false);
        setAnnouncementItem(null);
      }
    }
  }, [params.id]);

  const normalizeAnnouncementItem = (payload: any): AnnouncementItem | null => {
    if (!payload) return null;
    if (payload.data && payload.data.data) return payload.data.data as AnnouncementItem;
    if (payload.data) return payload.data as AnnouncementItem;
    return payload as AnnouncementItem;
  };

  const fetchAnnouncementItem = async (id: number) => {
    try {
      setLoading(true);
      const response = await apiService.getAnnouncementItem(id);
      const item = normalizeAnnouncementItem(response);
      setAnnouncementItem(item);
    } catch (error) {
      console.error('Error fetching announcement:', error);
      setAnnouncementItem(null);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: announcementItem?.title,
        text: announcementItem?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!announcementItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Announcement not found</h2>
          <Link href="/announcements" className="btn btn-primary">
            Back to Announcements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container-custom py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Announcements
          </button>
        </div>
      </div>

      <article className="py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="badge badge-info text-base px-4 py-2">
                  {announcementItem.priority}
                </span>
                {announcementItem.is_featured && (
                  <span className="badge badge-warning text-base px-4 py-2">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {announcementItem.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                {announcementItem.author_name && (
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span>{announcementItem.author_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{format(new Date(announcementItem.published_date), 'MMMM dd, yyyy')}</span>
                </div>
                {announcementItem.expiry_date && (
                  <div className="text-amber-600">
                    Expires {format(new Date(announcementItem.expiry_date), 'MMMM dd, yyyy')}
                  </div>
                )}
              </div>

              <button
                onClick={handleShare}
                className="btn btn-outline flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Announcement
              </button>
            </motion.div>

            {announcementItem.image_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8 rounded-2xl overflow-hidden shadow-xl"
              >
                <img
                  src={announcementItem.image_url}
                  alt={announcementItem.title}
                  className="w-full h-auto"
                />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="card p-8 md:p-12"
            >
              <div className="prose prose-lg max-w-none">
                {announcementItem.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Published on {format(new Date(announcementItem.published_date), 'MMMM dd, yyyy')}
                  </div>
                  <button
                    onClick={handleShare}
                    className="btn btn-outline btn-sm flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </article>
    </div>
  );
}
