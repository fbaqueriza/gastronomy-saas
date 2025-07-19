'use client'

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../components/AuthProvider'
import Navigation from '../../components/Navigation'
import { Order, OrderItem } from '../../types'
import { 
  Plus, 
  ShoppingCart, 
  Send,
  MessageSquare,
  FileText,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const { t } = useTranslation()
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-001',
      providerId: '1',
      items: [
        { productName: 'Tomatoes', quantity: 50, unit: 'kg', price: 2.5, total: 125 },
        { productName: 'Lettuce', quantity: 20, unit: 'kg', price: 1.8, total: 36 }
      ],
      status: 'sent',
      totalAmount: 161,
      currency: 'EUR',
      orderDate: new Date('2024-01-20'),
      dueDate: new Date('2024-01-25'),
      invoiceNumber: 'INV-2024-001',
      bankInfo: {
        iban: 'ES9121000418450200051332',
        swift: 'CAIXESBBXXX',
        bankName: 'CaixaBank'
      },
      receiptUrl: '',
      notes: 'Please deliver in the morning',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      providerId: '2',
      items: [
        { productName: 'Milk', quantity: 100, unit: 'L', price: 1.2, total: 120 },
        { productName: 'Cheese', quantity: 30, unit: 'kg', price: 8.5, total: 255 }
      ],
      status: 'pending',
      totalAmount: 375,
      currency: 'EUR',
      orderDate: new Date('2024-01-21'),
      dueDate: new Date('2024-01-26'),
      invoiceNumber: '',
      bankInfo: {},
      receiptUrl: '',
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])
  const [loading, setLoading] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'sent':
        return <Send className="h-4 w-4 text-blue-500" />
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSendOrder = useCallback(async (orderId: string) => {
    setLoading(true)
    try {
      // Simulate WhatsApp API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update order status
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'sent' as const, updatedAt: new Date() }
          : order
      ))
      
      // In real app, this would call Twilio WhatsApp API
      console.log('Sending order via WhatsApp:', orderId)
    } catch (error) {
      console.error('Failed to send order:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleUploadReceipt = useCallback((orderId: string, file: File) => {
    // Simulate file upload
    const receiptUrl = URL.createObjectURL(file)
    
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, receiptUrl, updatedAt: new Date() }
        : order
    ))
  }, [])

  const handleExtractData = useCallback(async (orderId: string) => {
    setLoading(true)
    try {
      // Simulate PDF parsing
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock extracted data
      const extractedData = {
        totalAmount: 161,
        currency: 'EUR',
        dueDate: new Date('2024-01-25'),
        invoiceNumber: 'INV-2024-001',
        bankInfo: {
          iban: 'ES9121000418450200051332',
          swift: 'CAIXESBBXXX',
          bankName: 'CaixaBank'
        }
      }
      
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              ...extractedData,
              status: 'confirmed' as const,
              updatedAt: new Date() 
            }
          : order
      ))
    } catch (error) {
      console.error('Failed to extract data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {t('orders.title')}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage orders and communicate with providers via WhatsApp
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Plus className="h-4 w-4 mr-2" />
                {t('orders.newOrder')}
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="px-4 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {orders.map((order) => (
                <li key={order.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getStatusIcon(order.status)}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              {order.orderNumber}
                            </p>
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {t(`orders.${order.status}`)}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <span>{order.items.length} items</span>
                            <span className="mx-2">•</span>
                            <span>{order.totalAmount} {order.currency}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleSendOrder(order.id)}
                            disabled={loading}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {t('orders.sendViaWhatsApp')}
                          </button>
                        )}
                        
                        {order.status === 'sent' && !order.receiptUrl && (
                          <label className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                            <Upload className="h-4 w-4 mr-1" />
                            {t('orders.uploadReceipt')}
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleUploadReceipt(order.id, file)
                              }}
                              className="hidden"
                            />
                          </label>
                        )}
                        
                        {order.receiptUrl && !order.invoiceNumber && (
                          <button
                            onClick={() => handleExtractData(order.id)}
                            disabled={loading}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            {t('orders.extractData')}
                          </button>
                        )}
                        
                        <button className="text-gray-400 hover:text-gray-500">
                          <span className="sr-only">View details</span>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Order Items */}
                    <div className="mt-4">
                      <div className="text-sm text-gray-500 mb-2">Order Items:</div>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.productName} - {item.quantity} {item.unit}</span>
                            <span>{item.total} {order.currency}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Extracted Data Preview */}
                    {order.invoiceNumber && (
                      <div className="mt-4 p-3 bg-green-50 rounded-md">
                        <div className="text-sm font-medium text-green-800 mb-2">
                          Extracted Data:
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Invoice:</span> {order.invoiceNumber}
                          </div>
                          <div>
                            <span className="text-gray-500">Due Date:</span> {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : ''}
                          </div>
                          <div>
                            <span className="text-gray-500">Bank:</span> {order.bankInfo?.bankName}
                          </div>
                          <div>
                            <span className="text-gray-500">IBAN:</span> {order.bankInfo?.iban}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 px-4 sm:px-0">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <MessageSquare className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  WhatsApp Order Workflow
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Create order from stock needs</li>
                    <li>Send order via WhatsApp to provider</li>
                    <li>Provider sends PDF receipt</li>
                    <li>Upload receipt to extract payment details</li>
                    <li>Review and confirm extracted data</li>
                    <li>Process payment and send confirmation</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 