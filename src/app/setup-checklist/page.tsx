'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n-context'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const REQUIRED_ITEMS = ['page', 'ad_account', 'pixel']
const RECOMMENDED_ITEMS = ['domain', 'events']
const OPTIONAL_ITEMS = ['bm', 'whatsapp']

function SetupChecklistContent() {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const route = searchParams.get('route') || 'retailer'
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  const allRequiredChecked = REQUIRED_ITEMS.every(item => checkedItems[`pre_setup_${item}`])

  const handleCheck = (itemKey: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }))
  }

  const handleNext = () => {
    if (allRequiredChecked) {
      router.push(`/questions?route=${route}`)
    }
  }

  const getItemStyle = (category: 'required' | 'recommended' | 'optional') => {
    switch (category) {
      case 'required':
        return {
          badge: 'bg-red-500/20 text-red-400 border-red-500/30',
          dot: 'bg-red-500',
          label: t('setup_checklist.required')
        }
      case 'recommended':
        return {
          badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          dot: 'bg-yellow-500',
          label: t('setup_checklist.recommended')
        }
      case 'optional':
        return {
          badge: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          dot: 'bg-gray-500',
          label: t('setup_checklist.optional')
        }
    }
  }

  const ChecklistItem = ({ 
    itemKey, 
    category,
    index 
  }: { 
    itemKey: string
    category: 'required' | 'recommended' | 'optional'
    index: number
  }) => {
    const fullKey = `pre_setup_${itemKey}`
    const isChecked = checkedItems[fullKey]
    const style = getItemStyle(category)
    
    return (
      <div className={`p-6 rounded-xl transition-all duration-300 ${
        isChecked 
          ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-400 border-2' 
          : 'bg-white/5 border-white/20 border hover:border-cyan-400/50 hover:bg-white/10'
      }`}>
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <button
            onClick={() => handleCheck(fullKey)}
            className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${
              isChecked 
                ? 'bg-cyan-500 border-cyan-500' 
                : 'border-white/30 hover:border-cyan-400'
            }`}
          >
            {isChecked && (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Content */}
          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-sm font-medium px-3 py-1 rounded-full border ${style.badge}`}>
                {style.label}
              </span>
              <span className="text-white/60 text-sm">{index}</span>
            </div>
            
            <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
              isChecked ? 'text-cyan-400' : 'text-white'
            }`}>
              {itemKey === 'page' && t('setup_checklist.items.page')}
              {itemKey === 'ad_account' && t('setup_checklist.items.ad_account')}
              {itemKey === 'pixel' && t('setup_checklist.items.pixel')}
              {itemKey === 'domain' && t('setup_checklist.items.domain')}
              {itemKey === 'events' && t('setup_checklist.items.events')}
              {itemKey === 'bm' && t('setup_checklist.items.bm')}
              {itemKey === 'whatsapp' && t('setup_checklist.items.whatsapp')}
            </h3>
            
            <p className="text-blue-200/70 text-sm leading-relaxed">
              {itemKey === 'page' && t('setup_checklist.items.page_desc')}
              {itemKey === 'ad_account' && t('setup_checklist.items.ad_account_desc')}
              {itemKey === 'pixel' && t('setup_checklist.items.pixel_desc')}
              {itemKey === 'domain' && t('setup_checklist.items.domain_desc')}
              {itemKey === 'events' && t('setup_checklist.items.events_desc')}
              {itemKey === 'bm' && t('setup_checklist.items.bm_desc')}
              {itemKey === 'whatsapp' && t('setup_checklist.items.whatsapp_desc')}
            </p>

            {/* View steps link */}
            <Link 
              href="/setup-steps" 
              className="inline-flex items-center gap-2 mt-3 text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-300"
            >
              <span>{t('setup_checklist.view_steps')}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background grid texture */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-12">
        {/* Progress indicator */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 rounded-full border border-white/20">
            <span className="text-cyan-400 font-medium">{t('setup_checklist.step')}</span>
            <span className="text-white/60">—</span>
            <span className="text-white font-semibold">{t('setup_checklist.title')}</span>
          </div>
        </div>

        {/* Main content card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-8">
          {/* Required items */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <h2 className="text-white font-semibold text-lg">{t('setup_checklist.required')}</h2>
              <span className="text-red-400 text-sm">(Must complete to continue)</span>
            </div>
            <div className="space-y-4">
              {REQUIRED_ITEMS.map((item, index) => (
                <ChecklistItem 
                  key={item} 
                  itemKey={item} 
                  category="required" 
                  index={index + 1} 
                />
              ))}
            </div>
          </div>

          {/* Recommended items */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <h2 className="text-white font-semibold text-lg">{t('setup_checklist.recommended')}</h2>
              <span className="text-yellow-400 text-sm">(Complete before launching)</span>
            </div>
            <div className="space-y-4">
              {RECOMMENDED_ITEMS.map((item, index) => (
                <ChecklistItem 
                  key={item} 
                  itemKey={item} 
                  category="recommended" 
                  index={index + 4} 
                />
              ))}
            </div>
          </div>

          {/* Optional items */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <h2 className="text-white font-semibold text-lg">{t('setup_checklist.optional')}</h2>
              <span className="text-gray-400 text-sm">(Specific routes or scale)</span>
            </div>
            <div className="space-y-4">
              {OPTIONAL_ITEMS.map((item, index) => (
                <ChecklistItem 
                  key={item} 
                  itemKey={item} 
                  category="optional" 
                  index={index + 6} 
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-white/20">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>{t('common.back')}</span>
            </Link>

            <button
              onClick={handleNext}
              disabled={!allRequiredChecked}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                allRequiredChecked
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 hover:scale-105 shadow-lg shadow-cyan-500/30'
                  : 'bg-white/10 text-white/40 border border-white/20 cursor-not-allowed'
              }`}
            >
              {allRequiredChecked ? t('setup_checklist.next') : t('setup_checklist.next_disabled')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SetupChecklistPage() {
  const { t, locale } = useI18n()
  const { user, loading } = useAuth()

  // 未登录时显示登录提示
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <Card className="w-full max-w-md bg-white/5 border-white/20 backdrop-blur-sm shadow-xl relative z-10">
          <CardContent className="text-center py-12">
            <p className="text-blue-200 mb-6">{locale === 'zh' ? '请登录以访问前期设置' : 'Please login to access setup checklist'}</p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30">
                {t('login.title')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 加载中时显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <SetupChecklistContent />
    </Suspense>
  )
}