'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Search } from 'lucide-react';
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

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorities, setPriorities] = useState<string[]>([]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    filterAnnouncements();
  }, [announcements, selectedPriority, searchTerm]);

  const normalizeAnnouncements = (payload: any): AnnouncementItem[] => {
    if (Array.isArray(payload)) {
      return payload as AnnouncementItem[];
    }
    if (payload && Array.isArray(payload.data)) {
      return payload.data as AnnouncementItem[];
    }
    if (payload && payload.data && Array.isArray(payload.data.data)) {
      return payload.data.data as AnnouncementItem[];
    }
    return [];
  };

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAnnouncements();
      const items = normalizeAnnouncements(response);
      setAnnouncements(items);
      const uniquePriorities = [...new Set(items.map((item: AnnouncementItem) => item.priority))];
      setPriorities(uniquePriorities as string[]);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
      setPriorities([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAnnouncements = () => {
    let filtered = announcements;

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(item => item.priority === selectedPriority);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAnnouncements(filtered);
  };

  const featuredAnnouncements = announcements.filter(item => item.is_featured);
  const regularAnnouncements = filteredAnnouncements.filter(item => !item.is_featured);

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
              Announcements
            </h1>
            <p className="text-xl text-emerald-100">
              Official notices and community updates
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
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              <button
                onClick={() => setSelectedPriority('all')}
                className={`btn whitespace-nowrap ${
                  selectedPriority === 'all'
                    ? 'btn-primary'
                    : 'btn-outline'
                }`}
              >
                All Announcements
              </button>
              {priorities.map(priority => (
                <button
                  key={priority}
                  onClick={() => setSelectedPriority(priority)}
                  className={`btn whitespace-nowrap ${
                    selectedPriority === priority
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredAnnouncements.length}</span> {filteredAnnouncements.length === 1 ? 'announcement' : 'announcements'}
          </div>
        </div>
      </section>

      {featuredAnnouncements.length > 0 && selectedPriority === 'all' && !searchTerm && (
        <section className="bg-gradient-to-b from-white to-gray-50 py-12">
          <div className="container-custom">
            <h2 className="font-display text-3xl font-bold mb-8 text-gray-900">
              Featured Announcements
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {featuredAnnouncements.slice(0, 2).map((item, index) => (
                <FeaturedAnnouncementCard key={item.id} item={item} index={index} />
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
          ) : regularAnnouncements.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No announcements found.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularAnnouncements.map((item, index) => (
                <AnnouncementCard key={item.id} item={item} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function FeaturedAnnouncementCard({ item, index }: { item: AnnouncementItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/announcements/${item.id}`}>
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
              <span className="badge badge-info">{item.priority}</span>
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
              {item.expiry_date && (
                <span className="text-amber-600">Expires {format(new Date(item.expiry_date), 'MMM dd, yyyy')}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function AnnouncementCard({ item, index }: { item: AnnouncementItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/announcements/${item.id}`}>
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
              <span className="badge badge-info">{item.priority}</span>
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
