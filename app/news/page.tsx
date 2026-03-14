'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Eye, ArrowRight, Search } from 'lucide-react';
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

export default function NewsPage() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    filterNews();
  }, [newsItems, selectedCategory, searchTerm]);

  const normalizeNews = (payload: any): NewsItem[] => {
    if (Array.isArray(payload)) {
      return payload as NewsItem[];
    }
    if (payload && Array.isArray(payload.data)) {
      return payload.data as NewsItem[];
    }
    if (payload && payload.data && Array.isArray(payload.data.data)) {
      return payload.data.data as NewsItem[];
    }
    return [];
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNews();
      const news = normalizeNews(response);
      setNewsItems(news);
      const uniqueCategories = [...new Set(news.map((item: NewsItem) => item.category))];
      setCategories(uniqueCategories as string[]);
    } catch (error) {
      console.error('Error fetching news:', error);
      setNewsItems([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filterNews = () => {
    let filtered = newsItems;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNews(filtered);
  };

  const featuredNews = newsItems.filter(item => item.is_featured);
  const regularNews = filteredNews.filter(item => !item.is_featured);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 to-transparent"></div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
              Community News
            </h1>
            <p className="text-xl text-emerald-100">
              Latest updates and stories from our mahallu
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`btn whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'btn-primary'
                    : 'btn-outline'
                }`}
              >
                All News
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`btn whitespace-nowrap ${
                    selectedCategory === category
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredNews.length}</span> {filteredNews.length === 1 ? 'article' : 'articles'}
          </div>
        </div>
      </section>

      {featuredNews.length > 0 && selectedCategory === 'all' && !searchTerm && (
        <section className="bg-gradient-to-b from-white to-gray-50 py-12">
          <div className="container-custom">
            <h2 className="font-display text-3xl font-bold mb-8 text-gray-900">
              Featured Stories
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {featuredNews.slice(0, 2).map((item, index) => (
                <FeaturedNewsCard key={item.id} item={item} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : regularNews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No news articles found.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularNews.map((item, index) => (
                <NewsCard key={item.id} item={item} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function FeaturedNewsCard({ item, index }: { item: NewsItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/news/${item.id}`}>
        <div className="card overflow-hidden hover:shadow-2xl transition-all h-full">
          {item.image_url && (
            <div className="relative h-64 bg-gradient-to-br from-emerald-100 to-teal-100 overflow-hidden">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          )}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge badge-info">{item.category}</span>
              <span className="badge badge-warning">Featured</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
              {item.title}
            </h3>
            <p className="text-gray-600 mb-4 line-clamp-3">{item.excerpt}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(item.published_date), 'MMM dd, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {item.view_count || 0}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/news/${item.id}`}>
        <div className="card overflow-hidden hover:shadow-xl transition-all h-full">
          {item.image_url && (
            <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-teal-100 overflow-hidden">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge badge-info">{item.category}</span>
            </div>
            <h3 className="font-display text-xl font-bold text-gray-900 mb-3 hover:text-emerald-600 transition-colors line-clamp-2">
              {item.title}
            </h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{item.excerpt}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(item.published_date), 'MMM dd, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <ArrowRight className="w-4 h-4" />
                Read more
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
