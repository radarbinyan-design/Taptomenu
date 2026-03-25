'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CreditCard,
  Crown,
  Check,
  ArrowUpRight,
  AlertTriangle,
  Clock,
  Receipt,
  Zap,
  Shield,
  Loader2,
  ExternalLink,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Globe,
  Wifi,
} from 'lucide-react'
import { useSubscription } from '@/hooks'
import { useToast } from '@/components/shared/Toast'
import { PLAN_LIMITS, type SubscriptionPlan } from '@/types'

// ─── Plan display config ─────────────────────────────────────────────────────

const PLAN_INFO: Record<SubscriptionPlan, {
  name: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
  description: string
  features: string[]
}> = {
  starter: {
    name: 'Starter',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: '🌱',
    description: 'Для начинающих',
    features: ['1 меню', '30 блюд', '2 языка', '1 NFC-тег'],
  },
  pro: {
    name: 'Pro',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: '⚡',
    description: 'Для растущего бизнеса',
    features: ['3 меню', '100 блюд', '5 языков', '5 NFC-тегов', 'Аналитика'],
  },
  premium: {
    name: 'Premium',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: '💎',
    description: 'Максимум возможностей',
    features: ['10 меню', '500 блюд', '20 языков', '20 NFC-тегов', 'DeepL переводы', 'Кастомные шаблоны'],
  },
  luxe: {
    name: 'LUXE',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: '👑',
    description: 'Всё безлимитно',
    features: ['Безлимит меню', 'Безлимит блюд', '33 языка', 'Безлимит NFC', 'AI-ассистент', 'DeepL переводы'],
  },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  trial: { label: 'Пробный период', color: 'text-blue-700', bg: 'bg-blue-100' },
  active: { label: 'Активна', color: 'text-green-700', bg: 'bg-green-100' },
  grace: { label: 'Льготный период', color: 'text-orange-700', bg: 'bg-orange-100' },
  blocked: { label: 'Заблокирована', color: 'text-red-700', bg: 'bg-red-100' },
  cancelled: { label: 'Отменена', color: 'text-gray-700', bg: 'bg-gray-100' },
}

const TX_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  succeeded: { label: 'Успешно', color: 'text-green-600' },
  pending: { label: 'Ожидание', color: 'text-yellow-600' },
  failed: { label: 'Ошибка', color: 'text-red-600' },
  refunded: { label: 'Возврат', color: 'text-blue-600' },
  cancelled: { label: 'Отменено', color: 'text-gray-600' },
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_SUBSCRIPTION = {
  id: 'demo-sub-001',
  plan: 'pro' as SubscriptionPlan,
  status: 'active',
  isYearly: false,
  trialEndsAt: null,
  currentPeriodEnd: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString(),
  graceEndsAt: null,
  cancelAtPeriodEnd: false,
  maxMenus: 3,
  maxDishes: 100,
  maxLanguages: 5,
  maxNfcTags: 5,
  stripeCustomerId: null,
  hasStripe: false,
  daysRemaining: 24,
}

const DEMO_USAGE = { menus: 2, dishes: 47, tables: 6 }

const DEMO_TRANSACTIONS = [
  { id: 'tx-1', type: 'subscription_renew', status: 'succeeded', amount: 2500, currency: 'usd', plan: 'pro', period: 'monthly', description: 'Pro план — ежемесячная оплата', receiptUrl: null, createdAt: '2026-03-01T10:00:00Z' },
  { id: 'tx-2', type: 'subscription_renew', status: 'succeeded', amount: 2500, currency: 'usd', plan: 'pro', period: 'monthly', description: 'Pro план — ежемесячная оплата', receiptUrl: null, createdAt: '2026-02-01T10:00:00Z' },
  { id: 'tx-3', type: 'subscription_create', status: 'succeeded', amount: 2500, currency: 'usd', plan: 'pro', period: 'monthly', description: 'Pro план — первая оплата', receiptUrl: null, createdAt: '2026-01-01T10:00:00Z' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const { toast } = useToast()
  const {
    subscription: realSub,
    usage: realUsage,
    transactions: realTx,
    isLoading,
    checkout,
    cancelSubscription,
    resumeSubscription,
    openPortal,
    refetch,
  } = useSubscription()

  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showAllTx, setShowAllTx] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  // Use real data if available, else demo
  const isDemo = !realSub
  const subscription = realSub ?? DEMO_SUBSCRIPTION
  const usage = realUsage ?? DEMO_USAGE
  const transactions = (realTx?.length ? realTx : DEMO_TRANSACTIONS)

  const planInfo = PLAN_INFO[subscription.plan as SubscriptionPlan] || PLAN_INFO.starter
  const statusInfo = STATUS_CONFIG[subscription.status] || STATUS_CONFIG.active

  // Calculate usage percentages
  const usageItems = useMemo(() => [
    { label: 'Меню', current: usage.menus, max: subscription.maxMenus, icon: '📋' },
    { label: 'Блюд', current: usage.dishes, max: subscription.maxDishes, icon: '🍽️' },
    { label: 'NFC-тегов', current: usage.tables, max: subscription.maxNfcTags, icon: '📱' },
    { label: 'Языков', current: 3, max: subscription.maxLanguages, icon: '🌐' },
  ], [usage, subscription])

  // URL params check for post-checkout redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === '1') {
      toast('Подписка успешно оформлена!', 'success')
      refetch()
      window.history.replaceState({}, '', '/dashboard/billing')
    } else if (params.get('cancelled') === '1') {
      toast('Оформление отменено', 'info')
      window.history.replaceState({}, '', '/dashboard/billing')
    }
  }, [toast, refetch])

  // ─── Actions ──────────────────────────────────────────────────────────

  const handleCheckout = async (plan: SubscriptionPlan) => {
    setActionLoading(`checkout-${plan}`)
    try {
      const result = await checkout(plan, billingCycle === 'yearly')
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      } else if (result.demo) {
        toast(result.message || 'План изменён (демо)', 'success')
        refetch()
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Ошибка при оформлении', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Вы уверены? Подписка будет отменена в конце текущего периода.')) return
    setActionLoading('cancel')
    try {
      await cancelSubscription()
      toast('Подписка будет отменена в конце периода', 'success')
      refetch()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Ошибка отмены', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleResume = async () => {
    setActionLoading('resume')
    try {
      await resumeSubscription()
      toast('Подписка восстановлена!', 'success')
      refetch()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Ошибка восстановления', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleOpenPortal = async () => {
    setActionLoading('portal')
    try {
      const result = await openPortal()
      window.open(result.portalUrl, '_blank')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Портал недоступен', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  // Format amount from cents
  const formatAmount = (cents: number, currency: string) => {
    const amount = cents / 100
    const symbol = currency === 'usd' ? '$' : currency === 'eur' ? '\u20ac' : currency.toUpperCase()
    return `${symbol}${amount.toFixed(2)}`
  }

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Биллинг и подписка</h1>
          <p className="text-gray-500 mt-1">Управление тарифным планом и платежами</p>
        </div>
        <div className="flex gap-2">
          {subscription.hasStripe && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenPortal}
              disabled={actionLoading === 'portal'}
            >
              {actionLoading === 'portal' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              Stripe Portal
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Demo banner */}
      {isDemo && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Демо-режим</p>
            <p className="text-xs text-amber-600">Настройте Stripe для приёма реальных платежей. Переключение плана работает локально.</p>
          </div>
        </div>
      )}

      {/* Current Plan Card */}
      <Card className={`${planInfo.borderColor} border-2`}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 ${planInfo.bgColor} rounded-2xl flex items-center justify-center text-2xl`}>
                {planInfo.icon}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className={`text-xl font-bold ${planInfo.color}`}>{planInfo.name}</span>
                  <Badge className={`${statusInfo.bg} ${statusInfo.color} border-0 text-xs font-medium`}>
                    {statusInfo.label}
                  </Badge>
                  {subscription.cancelAtPeriodEnd && (
                    <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                      Отменяется
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{planInfo.description}</p>
                {subscription.currentPeriodEnd && (
                  <p className="text-xs text-gray-400 mt-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {subscription.cancelAtPeriodEnd ? 'Действует до' : 'Следующий платёж'}:{' '}
                    {formatDate(subscription.currentPeriodEnd)}
                    {subscription.daysRemaining != null && ` (${subscription.daysRemaining} дн.)`}
                  </p>
                )}
                {subscription.status === 'trial' && subscription.trialEndsAt && (
                  <p className="text-xs text-blue-600 mt-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Пробный период до: {formatDate(subscription.trialEndsAt)}
                    {subscription.daysRemaining != null && ` (${subscription.daysRemaining} дн.)`}
                  </p>
                )}
                {subscription.status === 'grace' && subscription.graceEndsAt && (
                  <p className="text-xs text-orange-600 mt-1 font-medium">
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    Льготный период до: {formatDate(subscription.graceEndsAt)}. Обновите платёж!
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                ${subscription.isYearly
                  ? PLAN_LIMITS[subscription.plan as SubscriptionPlan]?.priceYearly || 0
                  : PLAN_LIMITS[subscription.plan as SubscriptionPlan]?.priceMonthly || 0
                }
              </div>
              <div className="text-sm text-gray-400">
                /{subscription.isYearly ? 'мес (годовой)' : 'мес'}
              </div>
            </div>
          </div>

          {/* Usage bars */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            {usageItems.map((item) => {
              const pct = item.max === -1 ? 10 : Math.min((item.current / item.max) * 100, 100)
              const isOver = item.max !== -1 && item.current >= item.max
              return (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>{item.icon} {item.label}</span>
                    <span className={isOver ? 'text-red-500 font-semibold' : 'font-medium'}>
                      {item.current}/{item.max === -1 ? '\u221e' : item.max}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver ? 'bg-red-400' : pct > 80 ? 'bg-amber-400' : 'bg-green-400'
                      }`}
                      style={{ width: `${Math.max(pct, 3)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-5 pt-5 border-t border-gray-100">
            {subscription.cancelAtPeriodEnd ? (
              <Button size="sm" onClick={handleResume} disabled={actionLoading === 'resume'}>
                {actionLoading === 'resume' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Восстановить подписку
              </Button>
            ) : (
              <>
                {subscription.status !== 'blocked' && subscription.status !== 'cancelled' && (
                  <Button size="sm" variant="outline" onClick={handleCancel} disabled={actionLoading === 'cancel'} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    {actionLoading === 'cancel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Отменить подписку
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Тарифные планы</h2>
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${billingCycle === 'monthly' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              Ежемесячно
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${billingCycle === 'yearly' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              Ежегодно <span className="text-green-600 font-bold">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.entries(PLAN_INFO) as [SubscriptionPlan, typeof PLAN_INFO[SubscriptionPlan]][]).map(([plan, info]) => {
            const limits = PLAN_LIMITS[plan]
            const isCurrentPlan = subscription.plan === plan
            const price = billingCycle === 'yearly' ? limits.priceYearly : limits.priceMonthly

            return (
              <Card
                key={plan}
                className={`relative transition-all ${isCurrentPlan ? `${info.borderColor} border-2 shadow-md` : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className={`${info.bgColor} ${info.color} border-0 text-xs px-3`}>
                      Текущий
                    </Badge>
                  </div>
                )}
                {plan === 'premium' && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-purple-100 text-purple-700 border-0 text-xs px-3">
                      Популярный
                    </Badge>
                  </div>
                )}
                <CardContent className="pt-6 pb-4">
                  <div className="text-center mb-4">
                    <div className="text-2xl mb-1">{info.icon}</div>
                    <div className={`text-lg font-bold ${info.color}`}>{info.name}</div>
                    <div className="text-xs text-gray-400 mb-3">{info.description}</div>
                    <div className="text-3xl font-bold text-gray-900">${price}</div>
                    <div className="text-xs text-gray-400">/мес</div>
                    {billingCycle === 'yearly' && (
                      <div className="text-xs text-green-600 mt-1">
                        ${price * 12}/год · экономия ${(limits.priceMonthly - limits.priceYearly) * 12}/год
                      </div>
                    )}
                  </div>

                  <ul className="space-y-2 mb-4 text-xs">
                    {info.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-gray-600">
                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <Button size="sm" className="w-full" disabled variant="outline">
                      <Check className="w-4 h-4" /> Текущий план
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleCheckout(plan)}
                      disabled={!!actionLoading}
                    >
                      {actionLoading === `checkout-${plan}` ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                      {PLAN_LIMITS[subscription.plan as SubscriptionPlan] &&
                       limits.priceMonthly > PLAN_LIMITS[subscription.plan as SubscriptionPlan].priceMonthly
                        ? 'Повысить' : 'Выбрать'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="w-4 h-4 text-gray-400" /> История платежей
            </CardTitle>
            {transactions.length > 3 && (
              <button
                onClick={() => setShowAllTx(!showAllTx)}
                className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium"
              >
                {showAllTx ? 'Свернуть' : 'Показать все'}
                {showAllTx ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Receipt className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Нет платежей</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(showAllTx ? transactions : transactions.slice(0, 3)).map((tx) => {
                const txStatus = TX_STATUS_CONFIG[tx.status] || TX_STATUS_CONFIG.pending
                return (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.status === 'succeeded' ? 'bg-green-100' : tx.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        {tx.status === 'succeeded' ? <Check className="w-4 h-4 text-green-600" /> :
                         tx.status === 'failed' ? <XCircle className="w-4 h-4 text-red-600" /> :
                         <Clock className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {tx.description || `${tx.plan} — ${tx.period}`}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{formatDate(tx.createdAt)}</span>
                          <span className={txStatus.color}>{txStatus.label}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${tx.status === 'succeeded' ? 'text-gray-900' : 'text-gray-400'}`}>
                        {formatAmount(tx.amount, tx.currency)}
                      </span>
                      {tx.receiptUrl && (
                        <a href={tx.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan features comparison */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Возможности вашего плана
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: 'Аналитика', icon: <Zap className="w-4 h-4" />, enabled: PLAN_LIMITS[subscription.plan as SubscriptionPlan]?.hasAnalytics },
              { label: 'AI-ассистент', icon: <Crown className="w-4 h-4" />, enabled: PLAN_LIMITS[subscription.plan as SubscriptionPlan]?.hasAi },
              { label: 'DeepL переводы', icon: <Globe className="w-4 h-4" />, enabled: PLAN_LIMITS[subscription.plan as SubscriptionPlan]?.hasDeepL },
              { label: 'Кастомный шаблон', icon: <Shield className="w-4 h-4" />, enabled: PLAN_LIMITS[subscription.plan as SubscriptionPlan]?.hasCustomTemplate },
              { label: 'Stripe оплата', icon: <CreditCard className="w-4 h-4" />, enabled: true },
              { label: 'Wi-Fi кнопка', icon: <Wifi className="w-4 h-4" />, enabled: true },
            ].map(feat => (
              <div
                key={feat.label}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${feat.enabled ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}
              >
                {feat.icon}
                <span className="text-sm font-medium">{feat.label}</span>
                {feat.enabled ? <Check className="w-4 h-4 ml-auto" /> : <XCircle className="w-4 h-4 ml-auto opacity-50" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
