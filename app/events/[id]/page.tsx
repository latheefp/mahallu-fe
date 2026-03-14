'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, ArrowLeft, Share2, User } from 'lucide-react';
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
  contact_phone?: string | null;
  contact_email?: string | null;
  registration_required?: boolean;
  registration_link?: string | null;
  category: string;
  is_featured: boolean;
  status: 'published' | 'draft';
  view_count?: number;
  author_name?: string | null;
  created: string;
  modified: string;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [eventItem, setEventItem] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
      const numericId = Number(rawId);
      if (!Number.isNaN(numericId)) {
        fetchEventItem(numericId);
      } else {
        console.error('[events] invalid id param', params.id);
        setLoading(false);
        setEventItem(null);
      }
    }
  }, [params.id]);

  const normalizeEventItem = (payload: any): EventItem | null => {
    if (!payload) return null;
    if (payload.data && payload.data.data) return payload.data.data as EventItem;
    if (payload.data) return payload.data as EventItem;
    return payload as EventItem;
  };

  const fetchEventItem = async (id: number) => {
    try {
      setLoading(true);
      const response = await apiService.getEventItem(id);
      const item = normalizeEventItem(response);
      setEventItem(item);
    } catch (error) {
      console.error('Error fetching event:', error);
      setEventItem(null);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: eventItem?.title,
        text: eventItem?.excerpt,
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

  if (!eventItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h2>
          <Link href="/events" className="btn btn-primary">
            Back to Events
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
            Back to Events
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
                  {eventItem.category}
                </span>
                {eventItem.is_featured && (
                  <span className="badge badge-warning text-base px-4 py-2">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {eventItem.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{format(new Date(eventItem.event_date), 'MMMM dd, yyyy')}</span>
                </div>
                {eventItem.event_end_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>Ends {format(new Date(eventItem.event_end_date), 'MMMM dd, yyyy')}</span>
                  </div>
                )}
                {eventItem.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{eventItem.location}</span>
                  </div>
                )}
                {eventItem.author_name && (
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span>{eventItem.author_name}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleShare}
                className="btn btn-outline flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Event
              </button>
            </motion.div>

            {eventItem.image_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8 rounded-2xl overflow-hidden shadow-xl"
              >
                <img
                  src={eventItem.image_url}
                  alt={eventItem.title}
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
                {eventItem.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="grid gap-4 text-sm text-gray-600">
                  {eventItem.organizer && (
                    <div>Organizer: {eventItem.organizer}</div>
                  )}
                  {eventItem.contact_phone && (
                    <div>Contact: {eventItem.contact_phone}</div>
                  )}
                  {eventItem.contact_email && (
                    <div>Email: {eventItem.contact_email}</div>
                  )}
                  {eventItem.registration_required && eventItem.registration_link && (
                    <div>
                      Registration: <a className="text-emerald-600 hover:underline" href={eventItem.registration_link} target="_blank" rel="noreferrer">Register here</a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </article>
    </div>
  );
}
