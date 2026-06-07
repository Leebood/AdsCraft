'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';

export default function HomePage() {
  const routes = [
    {key: 'retailer', route: 'retailer', label: '我卖产品,需要更多订单', desc: '电商、独立站、Shopify卖货'},
    {key: 'manufacturer', route: 'manufacturer', label: '我是工厂/制造商,找批发客户', desc: 'B2B出口,要询盘'},
    {key: 'localService', route: 'local_service', label: '我做本地服务,要预约/到店', desc: '方圆几公里的生意'},
    {key: 'brand', route: 'brand', label: '我做品牌,要让更多人知道', desc: '先种草,后转化'}
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="font-bold text-xl">AdsCraft</span>
          </div>
          <div className="flex gap-4 items-center">
            <a href="/privacy" className="text-sm hover:underline">隐私政策</a>
            <a href="/login" className="text-sm hover:underline">登录</a>
            <Button variant="default" size="sm">开始使用</Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gray-900">
            停止猜测。开始决策。
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Facebook广告管理器的选项是固定的。我们告诉你选哪个、为什么、跑偏了怎么调。
          </p>
        </div>

        {/* Route Selector */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            你卖什么或做什么?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routes.map(({key, route, label, desc}) => (
              <Card 
                key={key}
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
                onClick={() => window.location.href = `/questions?route=${route}`}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{label}</CardTitle>
                  <CardDescription>{desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">开始使用</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Value Proposition */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">配置推荐</h3>
            <p className="text-gray-600 text-sm">根据你的情况,告诉你在每个选项里选哪个</p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">原因分析</h3>
            <p className="text-gray-600 text-sm">解释为什么选这个不选那个</p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">诊断优化</h3>
            <p className="text-gray-600 text-sm">根据跑出的数据,判断问题出在哪</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            © 2026 AdsCraft. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="/privacy" className="text-sm hover:underline">隐私政策</a>
            <a href="/terms" className="text-sm hover:underline">服务条款</a>
          </div>
        </div>
      </footer>
    </div>
  );
}