'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Home, Users, Phone, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';
import apiService from '@/lib/api';
import type { Family } from '@/types';

export default function FamiliesPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchFamilies();
  }, [currentPage]);

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFamilies(currentPage, 20);
      setFamilies(response.data || response);
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching families:', error);
      // Mock data for demo
      setFamilies(generateMockFamilies());
    } finally {
      setLoading(false);
    }
  };

  const filteredFamilies = families.filter(family =>
    family.family_head_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.membership_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.house_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Family Directory
          </h1>
          <p className="text-gray-600 text-lg">
            Browse and search all registered families in the mahallu
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, membership number, or house name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            <button className="btn btn-outline flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredFamilies.length}</span> families
          </p>
        </div>

        {/* Families Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFamilies.map((family, index) => (
              <motion.div
                key={family.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/families/${family.id}`}>
                  <div className="card p-6 hover:shadow-xl transition-all cursor-pointer h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Home className="w-6 h-6 text-emerald-600" />
                      </div>
                      <span className="badge badge-info">
                        {family.membership_number}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">
                      {family.family_head_name}
                    </h3>

                    {family.house_name && (
                      <p className="text-gray-600 mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {family.house_name}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{family.number_of_members_in_family || 0} members</span>
                        <span className="text-gray-400">|</span>
                        <span>{family.male || 0}M / {family.female || 0}F</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{family.phone}</span>
                      </div>
                      {family.membership_date && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Member since {new Date(family.membership_date).getFullYear()}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <span className={`badge ${
                        family.family_type === 'native' ? 'badge-success' : 'badge-info'
                      }`}>
                        {family.family_type === 'native' ? 'Native' : 'Migrated'}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 flex items-center text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Mock data generator for demo
function generateMockFamilies(): Family[] {
  return Array.from({ length: 12 }, (_, i) => ({
    id: 3300 + i,
    membership_number: `MN${3000 + i}`,
    address: `Address ${i + 1}, Kerala`,
    phone: `+91 ${9000000000 + i}`,
    house_name: `House ${i + 1}`,
    previous_mahallu: i % 3 === 0 ? `Previous Mahallu ${i}` : undefined,
    membership_date: `202${i % 5}-0${(i % 9) + 1}-15`,
    number_of_members_in_family: 3 + (i % 5),
    male: 1 + (i % 3),
    female: 2 + (i % 3),
    monthly_income: 30000 + (i * 5000),
    type_of_house: ['Cottage', 'Villa', 'Apartment', 'Bungalow'][i % 4],
    do_you_have_vehicle: i % 2 === 0,
    vehicle_type: i % 2 === 0 ? ['Car', 'Bike', 'Van'][i % 3] : undefined,
    any_disabled_person: i % 5 === 0,
    any_patient: i % 4 === 0,
    user_id: 6,
    long_term_illness: i % 6 === 0,
    long_term_illness_details: i % 6 === 0 ? 'Details about illness' : undefined,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    year_settled_here: 2020 + (i % 5),
    bed_patient: i % 8 === 0,
    family_status_id: (i % 3) + 1,
    ward_id: (i % 4) + 1,
    family_type: i % 3 === 0 ? 'migrated' : 'native',
    family_head_name: `Family Head ${i + 1}`,
    subscription_amount: 500,
    panchayath_ward_id: (i % 3) + 1,
  }));
}
