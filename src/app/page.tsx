'use client';

import { useI18n } from '@/lib/i18n-context';
import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const { t } = useI18n();
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  const routes = [
    { id: 'retailer', title: t('route.retailer.title'), desc: t('route.retailer.desc') },
    { id: 'manufacturer', title: t('route.manufacturer.title'), desc: t('route.manufacturer.desc') },
    { id: 'localService', title: t('route.localService.title'), desc: t('route.localService.desc') },
    { id: 'brand', title: t('route.brand.title'), desc: t('route.brand.desc') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('home.title')}
          </h1>
          <h2 className="text-xl text-gray-600 mb-4">
            {t('home.subtitle')}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {t('home.description')}
          </p>
        </div>

        {/* Route Selection */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            {t('home.selectRoute')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {routes.map((route) => (
              <button
                key={route.id}
                onClick={() => setSelectedRoute(route.id)}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedRoute === route.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {route.title}
                </h4>
                <p className="text-gray-600">
                  {route.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        {selectedRoute && (
          <div className="text-center mt-8">
            <Link
              href="/questions"
              className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              {t('questions.generate')} →
            </Link>
          </div>
        )}

        {/* Value Proposition */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('home.value1.title')}
            </h3>
            <p className="text-gray-600">
              {t('home.value1.desc')}
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('home.value2.title')}
            </h3>
            <p className="text-gray-600">
              {t('home.value2.desc')}
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔧</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('home.value3.title')}
            </h3>
            <p className="text-gray-600">
              {t('home.value3.desc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}