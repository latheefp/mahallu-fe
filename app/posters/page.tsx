'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Download, X, Eye, MessageCircle } from 'lucide-react';
import apiService from '@/lib/api';

interface Poster {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  category?: string;
  event_date?: string;
  created: string;
  view_count?: number;
}

export default function PostersPage() {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoster, setSelectedPoster] = useState<Poster | null>(null);
  const buildWhatsappShareUrl = (poster: Poster) => {
    const message = `${poster.title}\n${poster.image_url}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  useEffect(() => {
    fetchPosters();
  }, []);

  const fetchPosters = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPosters();
      setPosters(response.data || response);
    } catch (error) {
      console.error('Error fetching posters:', error);
      setPosters(generateMockPosters());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Posters & Announcements
          </h1>
          <p className="text-gray-600 text-lg">
            View our latest event posters and visual announcements
          </p>
        </motion.div>

        {/* Posters Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : posters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No posters available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posters.map((poster, index) => (
              <motion.div
                key={poster.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedPoster(poster)}
                className="cursor-pointer group"
              >
                <div className="card overflow-hidden hover:shadow-2xl transition-all">
                  <div className="relative aspect-[3/4] bg-gray-200 overflow-hidden">
                    <img
                      src={poster.image_url}
                      alt={poster.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white font-semibold text-sm flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Click to view full size
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {poster.title}
                    </h3>
                    {poster.event_date && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(poster.event_date).toLocaleDateString()}
                      </div>
                    )}
                    {poster.category && (
                      <span className="badge badge-info">{poster.category}</span>
                    )}
                    <div className="mt-4">
                      <a
                        href={buildWhatsappShareUrl(poster)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Share WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {selectedPoster && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPoster(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPoster(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Poster Image */}
              <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={selectedPoster.image_url}
                  alt={selectedPoster.title}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                
                {/* Poster Info */}
                <div className="p-6 border-t border-gray-200">
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
                    {selectedPoster.title}
                  </h2>
                  {selectedPoster.description && (
                    <p className="text-gray-600 mb-4">{selectedPoster.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {selectedPoster.event_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(selectedPoster.event_date).toLocaleDateString()}
                        </div>
                      )}
                      {selectedPoster.category && (
                        <span className="badge badge-info">{selectedPoster.category}</span>
                      )}
                    </div>
                    <a
                      href={selectedPoster.image_url}
                      download
                      className="btn btn-primary flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                    <a
                      href={buildWhatsappShareUrl(selectedPoster)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Share WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

// Mock data
function generateMockPosters(): Poster[] {
  const categories = ['Events', 'Announcements', 'Programs', 'Celebrations'];
  const titles = [
    'Ramadan Iftar Program',
    'Annual General Meeting',
    'Quran Recitation Competition',
    'Community Health Camp',
    'Eid Celebration 2026',
    'Educational Scholarship Program',
    'Blood Donation Camp',
    'Youth Leadership Workshop',
  ];

  return Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    title: titles[i] || `Event Poster ${i + 1}`,
    description: `Important announcement for ${titles[i]}`,
    image_url: `https://picsum.photos/seed/poster${i}/600/800`,
    category: categories[i % categories.length],
    event_date: new Date(2026, 1, i + 10).toISOString(),
    created: new Date().toISOString(),
    view_count: Math.floor(Math.random() * 200) + 50,
  }));
}
