'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import apiService from '@/lib/api';

interface EventItem {
  id: number;
  title: string;
  description: string;
  excerpt?: string;
  image_url?: string;
  event_date: string;
  event_end_date?: string | null;
  location?: string | null;
  organizer?: string | null;
  category: string;
  is_featured: boolean;
  status: 'published' | 'draft';
  view_count?: number;
  created: string;
  modified: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, selectedCategory, searchTerm]);

  const normalizeEvents = (payload: any): EventItem[] => {
    if (Array.isArray(payload)) {
      return payload as EventItem[];
    }
    if (payload && Array.isArray(payload.data)) {
      return payload.data as EventItem[];
    }
    if (payload && payload.data && Array.isArray(payload.data.data)) {
      return payload.data.data as EventItem[];
    }
    return [];
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiService.getEvents();
      const items = normalizeEvents(response);
      setEvents(items);
      const uniqueCategories = [...new Set(items.map((item: EventItem) => item.category))];
      setCategories(uniqueCategories as string[]);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const featuredEvents = events.filter(item => item.is_featured);
  const regularEvents = filteredEvents.filter(item => !item.is_featured);

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
              Community Events
            </h1>
            <p className="text-xl text-emerald-100">
              Upcoming programs, gatherings, and activities
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
                placeholder="Search events..."
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
                All Events
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
            Showing <span className="font-semibold text-gray-900">{filteredEvents.length}</span> {filteredEvents.length === 1 ? 'event' : 'events'}
          </div>
        </div>
      </section>

      {featuredEvents.length > 0 && selectedCategory === 'all' && !searchTerm && (
        <section className="bg-gradient-to-b from-white to-gray-50 py-12">
          <div className="container-custom">
            <h2 className="font-display text-3xl font-bold mb-8 text-gray-900">
              Featured Events
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {featuredEvents.slice(0, 2).map((item, index) => (
                <FeaturedEventCard key={item.id} item={item} index={index} />
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
          ) : regularEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No events found.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularEvents.map((item, index) => (
                <EventCard key={item.id} item={item} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function FeaturedEventCard({ item, index }: { item: EventItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/events/${item.id}`}>
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
            <p className="text-gray-600 mb-4 line-clamp-3">{item.excerpt || item.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(item.event_date), 'MMM dd, yyyy')}
              </span>
              {item.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {item.location}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function EventCard({ item, index }: { item: EventItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/events/${item.id}`}>
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
            <p className="text-gray-600 mb-4 line-clamp-2">{item.excerpt || item.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(item.event_date), 'MMM dd, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <ArrowRight className="w-4 h-4" />
                View details
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
