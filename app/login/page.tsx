'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, ExternalLink, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8086/api';
  const backendLoginUrl = process.env.LOGIN_URL || 'http://localhost:8086/login';


  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      window.location.href = backendLoginUrl;
    }, 3000);

    return () => clearTimeout(timer);
  }, [backendLoginUrl]);

  const handleManualRedirect = () => {
    window.location.href = backendLoginUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 islamic-pattern opacity-10"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Main Card */}
        <div className="glass rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <h1 className="font-display text-3xl font-bold text-gray-900 mb-3">
            Admin Access
          </h1>
          
          <p className="text-gray-600 mb-6">
            Redirecting to admin login panel...
          </p>

          {/* Loading Animation */}
          <div className="flex justify-center mb-6">
            <div className="spinner"></div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              You will be redirected to login services to manage all mahallu content, news, and posters.
            </p>
          </div>

          {/* Manual Button */}
          <button
            onClick={handleManualRedirect}
            className="btn btn-primary w-full text-lg flex items-center justify-center gap-2"
          >
            Continue to Admin Panel
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="mt-6 text-sm text-gray-600">
            <p className="mb-2">
              <strong>Backend URL:</strong>
            </p>
            <a 
              href={apiBaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 font-mono text-xs break-all flex items-center justify-center gap-1"
            >
              {apiBaseUrl}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Info Box */}
        <div className="glass-dark rounded-xl p-6 text-center mt-6">
          <p className="text-white mb-3">
            <strong>What you can do in the admin panel:</strong>
          </p>
          <ul className="text-emerald-200 text-sm space-y-1">
            <li>✓ Create and publish news articles</li>
            <li>✓ Upload and manage posters</li>
            <li>✓ Update mahallu information</li>
            <li>✓ Manage families and members</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
