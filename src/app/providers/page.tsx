'use client'

import { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../components/AuthProvider'
import Navigation from '../../components/Navigation'
import SpreadsheetGrid from '../../components/DataGrid'
import { Provider } from '../../types'
import { 
  Plus, 
  Upload, 
  Download,
  FileText,
  Eye
} from 'lucide-react'

export default function ProvidersPage() {
  const { user, loading: authLoading } = useAuth()
  const { t } = useTranslation()
  const [providers, setProviders] = useState<Provider[]>([
    {
      id: '1',
      name: 'Fresh Foods Inc.',
      email: 'orders@freshfoods.com',
      phone: '+1-555-0123',
      address: '123 Market St, City, State 12345',
      categories: ['Produce', 'Dairy'],
      tags: ['organic', 'local'],
      notes: 'Reliable supplier for fresh produce',
      cbu: 'ES9121000418450200051332',
      alias: 'CAIXESBBXXX',
      cuitCuil: '20-12345678-9',
      razonSocial: 'CaixaBank',
      catalogs: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Organic Valley Co.',
      email: 'sales@organicvalley.com',
      phone: '+1-555-0456',
      address: '456 Farm Rd, Country, State 67890',
      categories: ['Organic', 'Dairy'],
      tags: ['organic', 'sustainable'],
      notes: 'Premium organic dairy products',
      cbu: 'ES9121000418450200051333',
      alias: 'CAIXESBBXXX',
      cuitCuil: '20-98765432-1',
      razonSocial: 'CaixaBank',
      catalogs: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])
  const [loading, setLoading] = useState(false)

  // PDF upload handler
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleCatalogUpload = (providerId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = URL.createObjectURL(file);
      setProviders(prev => prev.map(p =>
        p.id === providerId
          ? {
              ...p,
              catalogs: [
                ...p.catalogs,
                {
                  id: Date.now().toString(),
                  providerId,
                  name: file.name,
                  fileUrl: url,
                  fileName: file.name,
                  fileSize: file.size,
                  uploadedAt: new Date(),
                }
              ]
            }
          : p
      ));
    };
    reader.readAsArrayBuffer(file);
  };

  const columns = [
    { key: 'name', name: t('name'), width: 200, editable: true },
    { key: 'email', name: t('email'), width: 200, editable: true },
    { key: 'phone', name: t('phone'), width: 150, editable: true },
    { key: 'address', name: t('address'), width: 250, editable: true },
    { key: 'categories', name: t('category'), width: 150, editable: true, render: (row: Provider) => row?.categories?.join(', ') || '' },
    { key: 'tags', name: t('tags'), width: 150, editable: true, render: (row: Provider) => row?.tags?.join(', ') || '' },
    { key: 'notes', name: t('notes'), width: 200, editable: true },
    { key: 'cbu', name: t('cbu'), width: 200, editable: true },
    { key: 'alias', name: t('alias'), width: 150, editable: true },
    { key: 'cuitCuil', name: t('cuitCuil'), width: 150, editable: true },
    { key: 'razonSocial', name: t('razonSocial'), width: 200, editable: true },
    {
      key: 'catalogs',
      name: t('catalog'),
      width: 120,
      editable: false,
      render: (row: Provider) => (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {row?.catalogs?.length || 0} PDF
          </span>
          {row?.catalogs?.length > 0 && (
            <button
              className="text-blue-600 hover:text-blue-700"
              title="View PDF"
              onClick={() => {
                const pdf = row.catalogs[0];
                if (pdf?.fileUrl) window.open(pdf.fileUrl, '_blank');
              }}
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          <label className="text-green-600 hover:text-green-700 cursor-pointer">
            <Upload className="h-4 w-4" />
            <input
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  handleCatalogUpload(row.id, e.target.files[0]);
                  e.target.value = '';
                }
              }}
            />
          </label>
        </div>
      )
    }
  ]

  // Undo stack
  const [undoStack, setUndoStack] = useState<Provider[][]>([]);
  const pushUndo = () => setUndoStack(stack => [...stack, providers]);
  const handleUndo = () => {
    setUndoStack(stack => {
      if (stack.length === 0) return stack;
      const prev = stack[stack.length - 1];
      setProviders(prev);
      return stack.slice(0, -1);
    });
  };

  const handleDataChange = useCallback((newData: any[]) => {
    pushUndo();
    setProviders(newData.map(row => ({
      ...row,
      categories: typeof row.categories === 'string' ? row.categories.split(',').map((c: string) => c.trim()) : row.categories || [],
      tags: typeof row.tags === 'string' ? row.tags.split(',').map((t: string) => t.trim()) : row.tags || [],
      updatedAt: new Date()
    })));
  }, [providers]);

  const handleAddRow = useCallback(() => {
    pushUndo();
    const newProvider: Provider = {
      id: Date.now().toString(),
      name: '',
      email: '',
      phone: '',
      address: '',
      categories: [],
      tags: [],
      notes: '',
      cbu: '',
      alias: '',
      cuitCuil: '',
      razonSocial: '',
      catalogs: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setProviders([...providers, newProvider]);
  }, [providers]);

  const handleDeleteRows = useCallback((rowsToDelete: Provider[]) => {
    pushUndo();
    const idsToDelete = rowsToDelete.map(row => row.id);
    setProviders(providers.filter(provider => !idsToDelete.includes(provider.id)));
  }, [providers]);

  const csvEscape = (value: string) => {
    if (typeof value !== 'string') value = String(value ?? '');
    if (value.includes('"')) value = value.replace(/"/g, '""');
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value}"`;
    }
    return value;
  };

  const handleExport = useCallback(() => {
    const csvContent = [
      columns.map(col => csvEscape(col.name)).join(','),
      ...providers.map(provider => [
        csvEscape(provider.name ?? ''),
        csvEscape(provider.email ?? ''),
        csvEscape(provider.phone ?? ''),
        csvEscape(provider.address ?? ''),
        csvEscape((provider.categories ?? []).join(';')),
        csvEscape((provider.tags ?? []).join(';')),
        csvEscape(provider.notes ?? ''),
        csvEscape(provider.cbu ?? ''),
        csvEscape(provider.alias ?? ''),
        csvEscape(provider.cuitCuil ?? ''),
        csvEscape(provider.razonSocial ?? '')
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'providers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }, [providers, columns]);

  // Simple CSV row parser that handles quoted values
  function parseCsvRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  const handleImport = useCallback((file: File) => {
    pushUndo();
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(Boolean);
      // Normalize headers: remove common. prefix, lowercase, remove spaces
      const headers = parseCsvRow(lines[0]).map(h => h.trim().toLowerCase().replace(/^common\./, '').replace(/\s+/g, ''));
      const importedProviders = lines.slice(1).map((line, index) => {
        const values = parseCsvRow(line).map(v => v.trim());
        const get = (name: string) => {
          const idx = headers.indexOf(name);
          return idx !== -1 ? values[idx] : '';
        };
        return {
          id: (Date.now() + index).toString(),
          name: get('name'),
          email: get('email'),
          phone: get('phone'),
          address: get('address'),
          categories: get('category') ? get('category').split(';').map(c => c.trim()) : [],
          tags: get('tags') ? get('tags').split(';').map(t => t.trim()) : [],
          notes: get('notes'),
          cbu: get('cbu'),
          alias: get('alias'),
          cuitCuil: get('cuitcuil'),
          razonSocial: get('razonsocial'),
          catalogs: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
      });
      setProviders(prev => [...prev, ...importedProviders]);
    };
    reader.readAsText(file);
  }, []);

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
                {t('providers.title')}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your provider database with spreadsheet-style editing
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddRow}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('providers.addProvider')}
              </button>
            </div>
          </div>
        </div>

        {/* Spreadsheet Grid */}
        <div className="px-4 sm:px-0">
          <SpreadsheetGrid
            columns={columns}
            data={providers}
            onDataChange={handleDataChange}
            onAddRow={handleAddRow}
            onDeleteRows={handleDeleteRows}
            onExport={handleExport}
            onImport={handleImport}
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
                  Spreadsheet Tips
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Click any cell to edit inline</li>
                    <li>Use Ctrl+C/Ctrl+V to copy and paste from Excel/Sheets</li>
                    <li>Import CSV files to bulk add providers</li>
                    <li>Categories and tags should be comma-separated</li>
                    <li>Select multiple rows for bulk operations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 