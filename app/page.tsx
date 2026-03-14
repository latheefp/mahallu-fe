'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, MapPin, Phone, Mail, Users, BookOpen, Star } from 'lucide-react';
import apiService from '@/lib/api';

interface MahalluInfo {
  name: string;
  name_arabic?: string;
  tagline?: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  established_year?: number;
  registration_number?: string;
  president_name?: string;
  secretary_name?: string;
  total_families?: number;
  total_members?: number;
  active_families?: number;
  active_members?: number;
  logo_url?: string;
  cover_image_url?: string;
}

interface FeaturedNews {
  id: number;
  title: string;
  excerpt?: string;
  image_url?: string;
  published_date: string;
  category: string;
}

export default function HomePage() {
  const [mahalluInfo, setMahalluInfo] = useState<MahalluInfo | null>(null);
  const [featuredNews, setFeaturedNews] = useState<FeaturedNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const infoResponse = await apiService.getMahalluInfo();
      setMahalluInfo(infoResponse.data || infoResponse);

      const newsResponse = await apiService.getFeaturedNews();
      setFeaturedNews((newsResponse.data || newsResponse).slice(0, 3));
    } catch (error) {
      console.error('Error fetching data:', error);
      setMahalluInfo(null);
      setFeaturedNews([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: mahalluInfo?.cover_image_url 
              ? `url(${mahalluInfo.cover_image_url})`
              : 'linear-gradient(135deg, #006B3F 0%, #008B8B 100%)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
          <div className="absolute inset-0 islamic-pattern opacity-10"></div>
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl text-white"
            >
              {mahalluInfo?.logo_url && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="mb-6">
                  <img src={mahalluInfo.logo_url} alt={mahalluInfo.name} className="h-20 w-auto drop-shadow-2xl" />
                </motion.div>
              )}

              <h1 className="font-display text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg">
                {mahalluInfo?.name || 'Mahallu Name'}
              </h1>

              {mahalluInfo?.name_arabic && (
                <p className="font-arabic text-3xl md:text-4xl mb-4 drop-shadow-lg">{mahalluInfo.name_arabic}</p>
              )}

              {mahalluInfo?.tagline && (
                <p className="text-xl md:text-2xl text-emerald-200 mb-6 drop-shadow-lg">{mahalluInfo.tagline}</p>
              )}

              <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl leading-relaxed">
                {mahalluInfo?.description || 'Welcome to our community'}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/news" className="btn btn-secondary text-lg">Latest News & Updates</Link>
                <Link href="/about" className="btn btn-outline text-lg border-white text-white hover:bg-white hover:text-emerald-900">About Us</Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Info Bar */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <InfoStat icon={Users} value={mahalluInfo?.active_families ?? mahalluInfo?.total_families || 0} label="Families" delay={0} />
            <InfoStat icon={Users} value={mahalluInfo?.active_members ?? mahalluInfo?.total_members || 0} label="Members" delay={0.1} />
            <InfoStat icon={Calendar} value={mahalluInfo?.established_year || 'N/A'} label="Established" delay={0.2} />
            <InfoStat icon={Star} value={new Date().getFullYear() - (mahalluInfo?.established_year || new Date().getFullYear())} label="Years of Service" delay={0.3} />
          </div>
        </div>
      </section>

      {/* Featured News */}
      {featuredNews.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">Latest Updates</h2>
              <p className="text-xl text-gray-600">Stay informed with our recent announcements and news</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {featuredNews.map((news, index) => (
                <NewsCard key={news.id} news={news} index={index} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/news" className="btn btn-primary text-lg">View All News</Link>
            </div>
          </div>
        </section>
      )}

      {/* Contact Information */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600">We're here to serve our community</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            <ContactDetails mahalluInfo={mahalluInfo} />
            <Leadership mahalluInfo={mahalluInfo} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-10"></div>
        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">Stay Connected</h2>
            <p className="text-xl mb-8 text-emerald-100 max-w-2xl mx-auto">Get the latest updates, announcements, and community news</p>
            <Link href="/announcements" className="btn btn-secondary text-lg">View All Announcements</Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// Components
function InfoStat({ icon: Icon, value, label, delay }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay }} className="flex flex-col items-center">
      <Icon className="w-8 h-8 text-emerald-600 mb-2" />
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-gray-600">{label}</div>
    </motion.div>
  );
}

function NewsCard({ news, index }: { news: FeaturedNews; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
      <Link href={`/news/${news.id}`}>
        <div className="card overflow-hidden hover:shadow-2xl transition-all h-full">
          {news.image_url && (
            <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-teal-100 overflow-hidden">
              <img src={news.image_url} alt={news.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          )}
          <div className="p-6">
            <span className="badge badge-info mb-3">{news.category}</span>
            <h3 className="font-display text-xl font-bold text-gray-900 mb-3 hover:text-emerald-600 transition-colors">{news.title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{news.excerpt}</p>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(news.published_date).toLocaleDateString()}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function ContactDetails({ mahalluInfo }: { mahalluInfo: MahalluInfo | null }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
      <ContactItem icon={MapPin} title="Address" content={mahalluInfo?.address || 'Address not available'} />
      <ContactItem icon={Phone} title="Phone" content={mahalluInfo?.phone || 'Phone not available'} href={`tel:${mahalluInfo?.phone}`} />
      <ContactItem icon={Mail} title="Email" content={mahalluInfo?.email || 'Email not available'} href={`mailto:${mahalluInfo?.email}`} />
      {mahalluInfo?.registration_number && <ContactItem icon={BookOpen} title="Registration Number" content={mahalluInfo.registration_number} />}
    </motion.div>
  );
}

function ContactItem({ icon: Icon, title, content, href }: any) {
  const Content = href ? 'a' : 'p';
  return (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-emerald-600" />
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <Content {...(href ? { href } : {})} className="text-gray-600 hover:text-emerald-600">{content}</Content>
      </div>
    </div>
  );
}

function Leadership({ mahalluInfo }: { mahalluInfo: MahalluInfo | null }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8">
      <h3 className="font-display text-2xl font-bold text-gray-900 mb-6">Leadership</h3>
      <div className="space-y-4">
        {mahalluInfo?.president_name && <LeaderItem title="President" name={mahalluInfo.president_name} />}
        {mahalluInfo?.secretary_name && <LeaderItem title="Secretary" name={mahalluInfo.secretary_name} />}
      </div>
    </motion.div>
  );
}

function LeaderItem({ title, name }: { title: string; name: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
        <Users className="w-5 h-5 text-emerald-600" />
      </div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="font-semibold text-gray-900">{name}</p>
      </div>
    </div>
  );
}
