'use client'

import { useAuth } from '../../components/AuthProvider'
import { useTranslation } from 'react-i18next'
import Navigation from '../../components/Navigation'
import { 
  Users, 
  ShoppingCart, 
  CreditCard, 
  Package,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const { t } = useTranslation()

  // Debug logging
  useEffect(() => {
    console.log('Dashboard - User:', user)
    console.log('Dashboard - Loading:', loading)
  }, [user, loading])

  // Mock data - in real app, fetch from Firebase
  const stats = [
    {
      name: t('dashboard.totalProviders'),
      value: '24',
      icon: Users,
      href: '/providers',
      color: 'bg-blue-500'
    },
    {
      name: t('dashboard.pendingOrders'),
      value: '8',
      icon: ShoppingCart,
      href: '/orders',
      color: 'bg-yellow-500'
    },
    {
      name: t('dashboard.pendingPayments'),
      value: '12',
      icon: CreditCard,
      href: '/payments',
      color: 'bg-green-500'
    },
    {
      name: t('dashboard.lowStockItems'),
      value: '5',
      icon: Package,
      href: '/stock',
      color: 'bg-red-500'
    }
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'order',
      message: 'Order #1234 sent to Fresh Foods Inc.',
      time: '2 hours ago',
      status: 'sent'
    },
    {
      id: 2,
      type: 'payment',
      message: 'Payment confirmed for Order #1230',
      time: '4 hours ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'stock',
      message: 'Low stock alert: Tomatoes',
      time: '6 hours ago',
      status: 'warning'
    },
    {
      id: 4,
      type: 'provider',
      message: 'New provider added: Organic Valley',
      time: '1 day ago',
      status: 'info'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  // Show a fallback if no user but not loading
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access the dashboard.</p>
          <Link 
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('dashboard.welcome')}, {user.name}!
          </h1>
        </div>

        {/* Stats Grid */}
        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Link
                  key={stat.name}
                  href={stat.href}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`${stat.color} rounded-md p-3`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {stat.name}
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {stat.value}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 px-4 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {t('dashboard.recentActivity')}
              </h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentActivity.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== recentActivity.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              activity.status === 'completed' ? 'bg-green-500' :
                              activity.status === 'warning' ? 'bg-yellow-500' :
                              activity.status === 'sent' ? 'bg-blue-500' :
                              'bg-gray-500'
                            }`}>
                              {activity.type === 'order' && <ShoppingCart className="h-4 w-4 text-white" />}
                              {activity.type === 'payment' && <CreditCard className="h-4 w-4 text-white" />}
                              {activity.type === 'stock' && <AlertTriangle className="h-4 w-4 text-white" />}
                              {activity.type === 'provider' && <Users className="h-4 w-4 text-white" />}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                {activity.message}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {activity.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <Link
                  href="/orders"
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  {t('dashboard.viewAll')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 