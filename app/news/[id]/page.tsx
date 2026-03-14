'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, User, Eye, ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import apiService from '@/lib/api';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  image_url?: string;
  category: string;
  author_name?: string;
  published_date: string;
  view_count?: number;
  is_featured: boolean;
  status: 'published' | 'draft';
  created: string;
  modified: string;
}

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
      const numericId = Number(rawId);
      if (!Number.isNaN(numericId)) {
        fetchNewsItem(numericId);
      } else {
        console.error('[news] invalid id param', params.id);
        setLoading(false);
        setNewsItem(null);
      }
    }
  }, [params.id]);

  const normalizeNewsItem = (payload: any): NewsItem | null => {
    if (!payload) return null;
    if (payload.data && payload.data.data) return payload.data.data as NewsItem;
    if (payload.data) return payload.data as NewsItem;
    return payload as NewsItem;
  };

  const fetchNewsItem = async (id: number) => {
    try {
      setLoading(true);
      const response = await apiService.getNewsItem(id);
      const item = normalizeNewsItem(response);
      setNewsItem(item);

      const relatedResponse = await apiService.getRelatedNews(id);
      setRelatedNews(relatedResponse.data || relatedResponse || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      setNewsItem(null);
      setRelatedNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: newsItem?.title,
        text: newsItem?.excerpt,
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

  if (!newsItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h2>
          <Link href="/news" className="btn btn-primary">
            Back to News
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
            Back to News
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
                  {newsItem.category}
                </span>
                {newsItem.is_featured && (
                  <span className="badge badge-warning text-base px-4 py-2">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {newsItem.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                {newsItem.author_name && (
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span>{newsItem.author_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{format(new Date(newsItem.published_date), 'MMMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  <span>{newsItem.view_count || 0} views</span>
                </div>
              </div>

              <button
                onClick={handleShare}
                className="btn btn-outline flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Article
              </button>
            </motion.div>

            {newsItem.image_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8 rounded-2xl overflow-hidden shadow-xl"
              >
                <img
                  src={newsItem.image_url}
                  alt={newsItem.title}
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
                {newsItem.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Published on {format(new Date(newsItem.published_date), 'MMMM dd, yyyy')}
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

      {relatedNews.length > 0 && (
        <section className="py-12 bg-white border-t border-gray-200">
          <div className="container-custom">
            <h2 className="font-display text-3xl font-bold mb-8 text-gray-900">
              Related Articles
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {relatedNews.map((item) => (
                <Link key={item.id} href={`/news/${item.id}`}>
                  <div className="card overflow-hidden hover:shadow-xl transition-all cursor-pointer h-full">
                    {item.image_url && (
                      <div className="relative h-40 bg-gradient-to-br from-emerald-100 to-teal-100 overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <span className="badge badge-info mb-2">{item.category}</span>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-emerald-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {format(new Date(item.published_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
