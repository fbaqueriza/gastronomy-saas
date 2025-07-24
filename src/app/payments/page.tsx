'use client';

import { useState, useCallback } from 'react';
import { useSupabaseUser } from '../../hooks/useSupabaseUser';
import Navigation from '../../components/Navigation';
import SpreadsheetGrid from '../../components/DataGrid';
import { Payment } from '../../types';
import {
  Download,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Send,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import es from '../../locales/es';
import { useRouter } from 'next/navigation';

export default function PaymentsPage() {
  const { user, loading: authLoading } = useSupabaseUser();
  const router = useRouter();
  const isSeedUser = user?.email === 'test@test.com';

  const [payments, setPayments] = useState<Payment[]>(isSeedUser ? [
    {
      id: '1',
      orderId: 'ORD-001',
      providerId: '1',
      amount: 161,
      currency: 'EUR',
      status: 'pending',
      dueDate: new Date('2024-01-25'),
      invoiceNumber: 'INV-2024-001',
      bankInfo: {
        iban: 'ES9121000418450200051332',
        swift: 'CAIXESBBXXX',
        bankName: 'CaixaBank',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      orderId: 'ORD-002',
      providerId: '2',
      amount: 375,
      currency: 'EUR',
      status: 'pending',
      dueDate: new Date('2024-01-26'),
      invoiceNumber: 'INV-2024-002',
      bankInfo: {
        iban: 'ES9121000418450200051333',
        swift: 'CAIXESBBXXX',
        bankName: 'CaixaBank',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      orderId: 'ORD-003',
      providerId: '1',
      amount: 89,
      currency: 'EUR',
      status: 'paid',
      dueDate: new Date('2024-01-20'),
      invoiceNumber: 'INV-2024-003',
      bankInfo: {
        iban: 'ES9121000418450200051332',
        swift: 'CAIXESBBXXX',
        bankName: 'CaixaBank',
      },
      paidAt: new Date('2024-01-19'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ] : []);
  const [loading, setLoading] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);

  const columns = [
    { key: 'orderId', name: es.payments.orderId, width: 120, editable: false },
    { key: 'providerId', name: es.payments.provider, width: 150, editable: false },
    { key: 'amount', name: es.payments.amount, width: 100, editable: false },
    { key: 'currency', name: es.payments.currency, width: 80, editable: false },
    {
      key: 'status',
      name: es.payments.status,
      width: 120,
      editable: false,
      render: (value: string) => {
        const statusConfig = {
          pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
          paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
          overdue: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
        };
        const config =
          statusConfig[value as keyof typeof statusConfig] ||
          statusConfig.pending;
        const Icon = config.icon;
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
          >
            <Icon className="h-3 w-3 mr-1" />
            {value}
          </span>
        );
      },
    },
    {
      key: 'dueDate',
      name: es.payments.dueDate,
      width: 120,
      editable: false,
      render: (value: Date) =>
        value ? new Date(value).toLocaleDateString() : '',
    },
    {
      key: 'invoiceNumber',
      name: es.payments.invoiceNumber,
      width: 150,
      editable: false,
    },
    {
      key: 'bankInfo.bankName',
      name: es.payments.bankName,
      width: 150,
      editable: false,
    },
    {
      key: 'bankInfo.iban',
      name: es.payments.iban,
      width: 200,
      editable: false,
    },
    {
      key: 'bankInfo.swift',
      name: es.payments.swift,
      width: 120,
      editable: false,
    },
    {
      key: 'actions',
      name: es.payments.actions,
      width: 120,
      editable: false,
      render: (value: any, row: any) => {
        if (!row) {return null;}
        return (
          <div className="flex items-center space-x-2">
            {row.status === 'pending' && (
              <button
                onClick={() => handleMarkAsPaid(row.id)}
                className="text-green-600 hover:text-green-700"
                title={es.payments.markAsPaid}
              >
                <CheckCircle className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => handleSendConfirmation(row.id)}
              className="text-blue-600 hover:text-blue-700"
              title={es.payments.sendConfirmation}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  const handleMarkAsPaid = useCallback((paymentId: string) => {
    setPayments((prev) =>
      prev.map((payment) =>
        payment.id === paymentId
          ? {
            ...payment,
            status: 'paid' as const,
            paidAt: new Date(),
            updatedAt: new Date(),
          }
          : payment,
      ),
    );
  }, []);

  const handleSendConfirmation = useCallback(async (paymentId: string) => {
    setLoading(true);
    try {
      // Simulate WhatsApp API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Sending payment confirmation via WhatsApp:', paymentId);
    } catch (error) {
      console.error('Failed to send confirmation:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExportSelected = useCallback(() => {
    if (selectedPayments.length === 0) {return;}

    const selectedData = payments.filter((payment) =>
      selectedPayments.includes(payment.id),
    );

    // Prepare data for export
    const exportData = selectedData.map((payment) => ({
      [es.payments.providerName]: `Provider ${payment.providerId}`,
      [es.payments.orderId]: payment.orderId,
      [es.payments.amount]: payment.amount,
      [es.payments.currency]: payment.currency,
      [es.payments.invoiceNumber]: payment.invoiceNumber,
      [es.payments.dueDate]: payment.dueDate
        ? new Date(payment.dueDate).toLocaleDateString()
        : '',
      [es.payments.bankName]: payment.bankInfo?.bankName || '',
      [es.payments.iban]: payment.bankInfo?.iban || '',
      [es.payments.swift]: payment.bankInfo?.swift || '',
      [es.payments.status]: payment.status,
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');

    // Generate file and download
    XLSX.writeFile(
      wb,
      `payments-export-${new Date().toISOString().split('T')[0]}.xlsx`,
    );
  }, [selectedPayments, payments]);

  const handleExportAll = useCallback(() => {
    // Prepare data for export
    const exportData = payments.map((payment) => ({
      [es.payments.providerName]: `Provider ${payment.providerId}`,
      [es.payments.orderId]: payment.orderId,
      [es.payments.amount]: payment.amount,
      [es.payments.currency]: payment.currency,
      [es.payments.invoiceNumber]: payment.invoiceNumber,
      [es.payments.dueDate]: payment.dueDate
        ? new Date(payment.dueDate).toLocaleDateString()
        : '',
      [es.payments.bankName]: payment.bankInfo?.bankName || '',
      [es.payments.iban]: payment.bankInfo?.iban || '',
      [es.payments.swift]: payment.bankInfo?.swift || '',
      [es.payments.status]: payment.status,
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');

    // Generate file and download
    XLSX.writeFile(
      wb,
      `all-payments-${new Date().toISOString().split('T')[0]}.xlsx`,
    );
  }, [payments]);

  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const overduePayments = payments.filter((p) => {
    if (p.status !== 'pending') {return false;}
    return p.dueDate && new Date(p.dueDate) < new Date();
  });

  if (!authLoading && !user) {
    if (typeof window !== 'undefined') router.push('/auth/login');
    return null;
  }
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Cargando...</p></div></div>;
  }

  if (!user) {
    return null; // Will redirect to login
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
                {es.payments.title}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {es.payments.managePayments}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {selectedPayments.length > 0 && (
                <button
                  onClick={handleExportSelected}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {es.payments.exportSelected} ({selectedPayments.length})
                </button>
              )}

              <button
                onClick={handleExportAll}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="h-4 w-4 mr-2" />
                {es.payments.exportPayments}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-4 sm:px-0 mb-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {es.payments.pendingPayments}
                      </dt>
                      <dd className="text-lg font-medium text-yellow-600">
                        {pendingPayments.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {es.payments.overduePayments}
                      </dt>
                      <dd className="text-lg font-medium text-red-600">
                        {overduePayments.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {es.payments.totalAmountPending}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {pendingPayments.reduce((sum, p) => sum + p.amount, 0)}{' '}
                        EUR
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Grid */}
        <div className="px-4 sm:px-0">
          <SpreadsheetGrid
            columns={columns}
            data={payments}
            onDataChange={setPayments}
            onExport={handleExportAll}
            searchable={true}
            selectable={true}
            loading={loading}
          />
        </div>

        {/* Instructions */}
        <div className="mt-8 px-4 sm:px-0">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  {es.payments.paymentManagementTips}
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      {es.payments.selectPaymentsForExport}
                    </li>
                    <li>{es.payments.exportAllPayments}</li>
                    <li>{es.payments.markAsPaid}</li>
                    <li>
                      {es.payments.sendConfirmationViaWhatsApp}
                    </li>
                    <li>
                      {es.payments.trackOverduePayments}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
 