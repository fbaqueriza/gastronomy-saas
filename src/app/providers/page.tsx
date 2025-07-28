'use client';

import { useState, useCallback, useRef } from 'react';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import Navigation from '../../components/Navigation';
import DataGrid from '../../components/DataGrid';
import { Provider } from '../../types';
import { Plus, Upload, Download, FileText, Eye, MessageSquare } from 'lucide-react';
import { useUndo } from '../../hooks/useUndo';
import { useCSV } from '../../hooks/useCSV';
import {
  createNewProvider,
  processProviderData,
  handleCatalogUpload,
  csvEscape,
  parseCsvRow,
} from '../../features/providers/providerUtils';
import WhatsAppChat from '../../components/WhatsAppChat';
import { DataProvider, useData } from '../../components/DataProvider';
import es from '../../locales/es';
import { useRouter } from 'next/navigation';

export default function ProvidersPageWrapper() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const router = useRouter();
  if (!authLoading && !user) {
    if (typeof window !== 'undefined') router.push('/auth/login');
    return null;
  }
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Cargando...</p></div></div>;
  }
  return (
    <DataProvider userEmail={user?.email ?? undefined}>
      <ProvidersPage />
    </DataProvider>
  );
}

function ProvidersPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const { providers, orders, addProvider, deleteProvider, updateProvider, fetchAll } = useData();
  const isSeedUser = user?.email === 'test@test.com';

  // Debug log for loading and user
  if (typeof window !== 'undefined') {
    console.log('ProvidersPage: authLoading:', authLoading, 'user:', user);
  }

  const [loading, setLoading] = useState(false);
  const [addingProvider, setAddingProvider] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  // PDF upload handler
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleCatalogUploadLocal = (providerId: string, file: File) => {
    // setProviders((prev) => handleCatalogUpload(prev, providerId, file)); // This line was removed
  };

  const columns = [
    {
      key: 'acciones',
      name: 'Acciones',
      width: 120,
      editable: false,
      render: (row: Provider) => (
        <div className="flex gap-1 justify-center items-center" style={{ width: 120, minWidth: 120, maxWidth: 120 }}>
          <button
            className="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            title="Ver catálogo del proveedor"
            aria-label="Ver catálogo del proveedor"
            onClick={() => {
              const pdf = row.catalogs[0];
              if (pdf?.fileUrl) {window.open(pdf.fileUrl, '_blank');}
            }}
            disabled={!row?.catalogs?.length}
            tabIndex={0}
          >
            <Eye className="h-4 w-4 text-blue-600" />
          </button>
          <button
            className="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400"
            onClick={() => {
              setSelectedProvider(row);
              setIsWhatsAppOpen(true);
            }}
            title="Abrir chat con el proveedor"
            aria-label="Abrir chat con el proveedor"
            tabIndex={0}
          >
            <MessageSquare className="h-4 w-4 text-green-600" />
          </button>

        </div>
      ),
    },
    { key: 'name', name: es.providers.name, width: 140, editable: true },
    { key: 'contactName', name: es.providers.contactName, width: 140, editable: true },
    {
      key: 'categories',
      name: es.providers.category,
      width: 140,
      editable: true,
    },
    {
      key: 'notes',
      name: es.providers.notes,
      width: 250,
      editable: true,
    },
    { key: 'cbu', name: es.providers.cbu, width: 140, editable: true },
    { key: 'alias', name: es.providers.alias, width: 100, editable: true },
    { key: 'phone', name: es.providers.phone, width: 100, editable: true },
    { key: 'cuitCuil', name: es.providers.cuitCuil, width: 100, editable: true },
    { key: 'razonSocial', name: es.providers.razonSocial, width: 120, editable: true },
    { key: 'email', name: es.providers.email, width: 160, editable: true },
    { key: 'address', name: es.providers.address, width: 180, editable: true },
  ];

  // Undo functionality
  // Remove this block:
  // const { data: providers, setData: setProviders, pushUndo, undo, canUndo } = useUndo<Provider>(isSeedUser ? [
  //   {
  //     id: '1',
  //     name: 'Distribuidora Gastronómica S.A.',
  //     email: 'pedidos@distgastronomica.com',
  //     phone: '+54 11 4567-8901',
  //     address: 'Av. Corrientes 1234, CABA, Buenos Aires',
  //     categories: ['Proveeduría General', 'Lácteos', 'Frescos'],
  //     tags: ['confiable', 'entrega rápida'],
  //     notes: 'Proveedor principal con amplio catálogo y entrega en 24h',
  //     cbu: 'ES9121000418450200051332',
  //     alias: 'DISTGASTRO',
  //     cuitCuil: '30-12345678-9',
  //     razonSocial: 'Distribuidora Gastronómica S.A.',
  //     catalogs: [],
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   },
  //   {
  //     id: '2',
  //     name: 'Carnes Premium del Sur',
  //     email: 'ventas@carnespremium.com',
  //     phone: '+54 11 3456-7890',
  //     address: 'Ruta 2 Km 45, La Plata, Buenos Aires',
  //     categories: ['Carnes', 'Proteínas', 'Premium'],
  //     tags: ['premium', 'calidad superior'],
  //     notes: 'Especialistas en carnes premium y cortes especiales',
  //     cbu: 'ES9121000418450200051333',
  //     alias: 'CARNESUR',
  //     cuitCuil: '30-98765432-1',
  //     razonSocial: 'Carnes Premium del Sur S.R.L.',
  //     catalogs: [],
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   },
  //   {
  //     id: '3',
  //     name: 'Pescados Frescos Mar del Plata',
  //     email: 'pedidos@pescadosfrescos.com',
  //     phone: '+54 223 456-7890',
  //     address: 'Puerto de Mar del Plata, Buenos Aires',
  //     categories: ['Pescados', 'Mariscos', 'Frescos'],
  //     tags: ['fresco', 'directo del mar'],
  //     notes: 'Pescados y mariscos frescos directo del puerto',
  //     cbu: 'ES9121000418450200051334',
  //     alias: 'PESCADOSMP',
  //     cuitCuil: '30-45678912-3',
  //     razonSocial: 'Pescados Frescos MDP S.A.',
  //     catalogs: [],
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   },
  //   {
  //     id: '4',
  //     name: 'Verduras Orgánicas La Huerta',
  //     email: 'info@lahuertaorganica.com',
  //     phone: '+54 11 2345-6789',
  //     address: 'Ruta 8 Km 32, San Vicente, Buenos Aires',
  //     categories: ['Verduras', 'Orgánicas', 'Frescos'],
  //     tags: ['orgánico', 'sustentable'],
  //     notes: 'Verduras orgánicas de producción propia',
  //     cbu: 'ES9121000418450200051335',
  //     alias: 'HUERTAORG',
  //     cuitCuil: '30-78912345-6',
  //     razonSocial: 'La Huerta Orgánica S.R.L.',
  //     catalogs: [],
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   },
  //   {
  //     id: '5',
  //     name: 'Lácteos Artesanales El Tambo',
  //     email: 'ventas@eltambo.com',
  //     phone: '+54 11 1234-5678',
  //     address: 'Ruta 6 Km 78, Cañuelas, Buenos Aires',
  //     categories: ['Lácteos', 'Artesanal', 'Quesos'],
  //     tags: ['artesanal', 'tradicional'],
  //     notes: 'Lácteos artesanales y quesos de autor',
  //     cbu: 'ES9121000418450200051336',
  //     alias: 'ELTAMBO',
  //     cuitCuil: '30-32165498-7',
  //     razonSocial: 'El Tambo Artesanal S.A.',
  //     catalogs: [],
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   },
  // ] : []);

  const handleDataChange = useCallback(
    async (newData: any[]) => {
      if (!user) return;
      console.log('handleDataChange called with:', newData);
      
      // Solo actualizar si hay cambios reales
      const changedProviders = newData.filter((provider, index) => {
        const originalProvider = providers[index];
        return originalProvider && (
          provider.name !== originalProvider.name ||
          provider.contactName !== originalProvider.contactName ||
          provider.phone !== originalProvider.phone ||
          provider.email !== originalProvider.email ||
          provider.address !== originalProvider.address ||
          provider.categories !== originalProvider.categories ||
          provider.notes !== originalProvider.notes ||
          provider.cbu !== originalProvider.cbu ||
          provider.alias !== originalProvider.alias ||
          provider.cuitCuil !== originalProvider.cuitCuil ||
          provider.razonSocial !== originalProvider.razonSocial
        );
      });
      
      console.log('🔄 Proveedores con cambios detectados:', changedProviders.length);
      if (changedProviders.length > 0) {
        console.log('📝 Detalles de cambios:', changedProviders.map(p => ({
          id: p.id,
          name: p.name,
          cbu: p.cbu,
          alias: p.alias,
          cuitCuil: p.cuitCuil,
          razonSocial: p.razonSocial
        })));
      }
      
      // Actualizar solo los proveedores modificados
      for (const provider of changedProviders) {
        try {
          console.log('🔄 Actualizando proveedor:', provider.id, provider.name);
          await updateProvider(provider);
          console.log('✅ Proveedor actualizado exitosamente:', provider.id);
        } catch (error) {
          console.error('❌ Error updating provider:', provider.id, error);
        }
      }
    },
    [user, updateProvider, providers],
  );

  const handleAddRow = useCallback(() => {
    if (!user || addingProvider) {
      console.error('No user available for adding provider or already adding');
      return;
    }
    
    setAddingProvider(true);
    console.log('Adding new provider for user:', user.id);
    const newProvider = createNewProvider();
    newProvider.user_id = user.id;
    console.log('New provider:', newProvider);
    
    // Forzar actualización inmediata del estado
    addProvider(newProvider, user.id).then(() => {
      console.log('Provider added successfully');
      setAddingProvider(false);
      // Forzar re-render del DataGrid
      setTimeout(() => {
        fetchAll();
      }, 100);
    }).catch(error => {
      console.error('Error adding provider:', error);
      setAddingProvider(false);
    });
  }, [user, addProvider, addingProvider, fetchAll]);

  const handleDeleteRows = useCallback(
    async (rowsToDelete: Provider[]) => {
      if (!rowsToDelete || rowsToDelete.length === 0 || !user) return;
      
      // Verificar si alguno tiene pedidos asociados
      const providersWithOrders = [];
      for (const provider of rowsToDelete) {
        const providerOrders = orders.filter(order => order.providerId === provider.id);
        if (providerOrders.length > 0) {
          providersWithOrders.push({
            provider,
            orderCount: providerOrders.length
          });
        }
      }
      
      let forceDelete = false;
      if (providersWithOrders.length > 0) {
        const providerNames = providersWithOrders.map(p => `${p.provider.name} (${p.orderCount} pedidos)`).join('\n• ');
        const confirmMessage = `Los siguientes proveedores tienen pedidos asociados:\n\n• ${providerNames}\n\n¿Deseas eliminarlos junto con todos sus pedidos?\n\n⚠️ Esta acción no se puede deshacer.`;
        forceDelete = confirm(confirmMessage);
        
        if (!forceDelete) {
          console.log('Borrado cancelado por el usuario');
          return;
        }
      }
      
      setLoading(true);
      try {
        const ids = rowsToDelete.map(row => row.id);
        console.log('Intentando borrar proveedores:', ids, forceDelete ? '(con pedidos)' : '(sin pedidos)');
        await deleteProvider(ids, user.id, true, forceDelete); // batch delete
        console.log('Proveedores eliminados exitosamente:', ids);
      } catch (err) {
        console.error('Error deleting providers:', rowsToDelete, err);
        // Mostrar mensaje de error al usuario
        alert('Algunos proveedores no pudieron ser eliminados. Esto puede deberse a:\n\n• Tienen pedidos asociados\n• No pertenecen a tu cuenta\n• Ya fueron eliminados\n\nRevisa la consola para más detalles.');
      }
      setLoading(false);
    },
    [deleteProvider, user, orders]
  );

  const csvEscape = (value: string) => {
    if (typeof value !== 'string') {value = String(value ?? '');}
    value = value.replace(/"/g, '""');
    return `"${value}"`;
  };

  const exportColumns = columns.filter(col => !['acciones'].includes(col.key));
  const handleExport = useCallback(() => {
    // Use columns for headers and order
    const headers = exportColumns.map(col => csvEscape(col.name));
    const csvRows = [
      headers.join(','),
      ...providers.map((provider) =>
        exportColumns.map(col => {
          let v = (provider as any)[col.key];
          if (Array.isArray(v)) return csvEscape(v.join(';'));
          if (col.key === 'acciones') return csvEscape('Sí'); // Always 'Sí' for the combined column
          return csvEscape(v ?? '');
        }).join(',')
      ),
    ];
    const csvContent = csvRows.join('\n');
    // Add BOM for Excel
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'proveedores.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }, [providers, exportColumns]);

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

  const normalizeHeader = (str: string) => str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
    .replace(/\s+/g, '') // quita espacios
    .replace(/[^a-z0-9]/g, ''); // quita caracteres especiales

  const headerMap: Record<string, string> = {
    'nombre': 'name',
    'name': 'name',
    'contacto': 'contactName',
    'contactname': 'contactName',
    'contact_name': 'contactName',
    'contacto_nombre': 'contactName',
    'nombre_contacto': 'contactName',
    'contact': 'contactName',
    'nombrecontacto': 'contactName',
    'contactonombre': 'contactName',
    'contactopersona': 'contactName',
    'personacontacto': 'contactName',
    'contactperson': 'contactName',
    'personcontact': 'contactName',
    'categoría': 'categories',
    'categoria': 'categories',
    'categorias': 'categories',
    'category': 'categories',
    'tags': 'tags',
    'notas': 'notes',
    'notes': 'notes',
    'cbu': 'cbu',
    'alias': 'alias',
    'razonsocial': 'razonSocial',
    'razon social': 'razonSocial',
    'cuit': 'cuitCuil',
    'cuitcuil': 'cuitCuil',
    'email': 'email',
    'phone': 'phone',
    'telefono': 'phone',
    'direccion': 'address',
    'address': 'address',
    'catalogos': 'catalogs',
    'catalogs': 'catalogs',
  };

  const handleImport = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(Boolean);
      if (lines.length < 2) {
        setImportMessage('El archivo CSV está vacío o no tiene datos.');
        return;
      }
      // Usar parseCsvRow para headers y filas
      const rawHeaders = parseCsvRow(lines[0]).map(h => normalizeHeader(h));
      const headers = rawHeaders.map(h => headerMap[h] || h);
      
      // Debug: mostrar headers procesados
      console.log('Headers originales:', parseCsvRow(lines[0]));
      console.log('Headers normalizados:', rawHeaders);
      console.log('Headers mapeados:', headers);
      console.log('HeaderMap keys disponibles:', Object.keys(headerMap));
      
      // Verificar si contactName está en los headers
      const hasContactName = headers.includes('contactName');
      console.log('¿Incluye contactName?', hasContactName);
      if (!hasContactName) {
        console.log('Headers que podrían ser contactName:', rawHeaders.filter(h => h.includes('contact') || h.includes('persona') || h.includes('nombre')));
      }
      
      const required = ['name', 'categories'];
      const missing = required.filter(r => !headers.includes(r));
      if (missing.length > 0) {
        setImportMessage('Faltan columnas requeridas: ' + missing.join(', '));
        return;
      }
      const importedProviders = lines.slice(1).map((line, index) => {
        const values = parseCsvRow(line);
        const row: any = {};
        headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
        
        // Debug para la primera fila
        if (index === 0) {
          console.log('Primera fila de datos:');
          console.log('Headers:', headers);
          console.log('Values:', values);
          console.log('Row procesado:', row);
          console.log('contactName value:', row.contactName);
        }
        
        const categories = row.categories ? String(row.categories).split(';').map((c: string) => c.trim()).filter(Boolean) : [];
        return {
          name: row.name || '',
          contactName: row.contactName || '',
          categories,
          tags: row.tags ? String(row.tags).split(';').map((t: string) => t.trim()).filter(Boolean) : [],
          notes: row.notes || '',
          cbu: row.cbu || '',
          alias: row.alias || '',
          razonSocial: row.razonSocial || '',
          cuitCuil: row.cuitCuil || '',
          email: row.email || '',
          phone: row.phone || '',
          address: row.address || '',
          catalogs: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });
      setLoading(true);
      let successCount = 0;
      let errorCount = 0;
      try {
        const safeItems = importedProviders.map(item => ({
          name: item.name,
          contact_name: item.contactName || '',
          categories: item.categories,
          tags: item.tags,
          notes: item.notes,
          cbu: item.cbu,
          alias: item.alias,
          razon_social: item.razonSocial,
          cuit_cuil: item.cuitCuil,
          email: item.email,
          phone: item.phone,
          address: item.address,
          catalogs: item.catalogs,
          created_at: item.createdAt,
          updated_at: item.updatedAt,
          user_id: user.id,
        }));
        if (safeItems.length > 0) {
          await addProvider(safeItems, user.id, true);
          successCount = safeItems.length;
        }
      } catch (err: any) {
        errorCount = importedProviders.length;
        console.error('Error importing providers batch:', err);
      }
      setLoading(false);
      if (errorCount === 0) {
        setImportMessage(`¡Importación exitosa! Se importaron ${successCount} proveedores.`);
        // Actualizar los datos después de la importación exitosa
        setTimeout(() => {
          fetchAll();
        }, 500);
      } else {
        setImportMessage(`Importación completada con ${successCount} éxitos y ${errorCount} errores. Revisa la consola para detalles.`);
      }
    };
    reader.readAsText(file);
  }, [addProvider, user]);

  // Importación masiva de providers (ejemplo CSV)
  const handleImportProviders = useCallback(async (importedProviders: any[]) => {
    if (!user) return;
    setLoading(true);
    let successCount = 0;
    let errorCount = 0;
    for (const provider of importedProviders) {
      try {
        // Remove id if present
        const { id, ...providerWithoutId } = provider;
        // Ensure categories, tags, catalogs are arrays
        const safeProvider = {
          ...providerWithoutId,
          categories: Array.isArray(providerWithoutId.categories)
            ? providerWithoutId.categories
            : (typeof providerWithoutId.categories === 'string' && providerWithoutId.categories ? providerWithoutId.categories.split(';').map((c: string) => c.trim()) : []),
          tags: Array.isArray(providerWithoutId.tags)
            ? providerWithoutId.tags
            : (typeof providerWithoutId.tags === 'string' && providerWithoutId.tags ? providerWithoutId.tags.split(';').map((t: string) => t.trim()) : []),
          catalogs: Array.isArray(providerWithoutId.catalogs) ? providerWithoutId.catalogs : [],
          user_id: user.id,
        };
        // Remove undefined fields
        Object.keys(safeProvider).forEach(key => {
          if (safeProvider[key] === undefined) delete safeProvider[key];
        });
        // Map camelCase to snake_case for DB
        const safeProviderSnake = {
          ...safeProvider,
          contact_name: safeProvider.contactName,
          razon_social: safeProvider.razonSocial,
          cuit_cuil: safeProvider.cuitCuil,
          created_at: safeProvider.createdAt,
          updated_at: safeProvider.updatedAt,
        };
        delete safeProviderSnake.contactName;
        delete safeProviderSnake.razonSocial;
        delete safeProviderSnake.cuitCuil;
        delete safeProviderSnake.createdAt;
        delete safeProviderSnake.updatedAt;
        console.log('Insertando provider en Supabase:', JSON.stringify(safeProviderSnake, null, 2));
        const result = await addProvider(safeProviderSnake, user.id);
        if (result && result.error) {
          errorCount++;
          console.error('Error de Supabase:', JSON.stringify(result.error, null, 2));
        } else {
          successCount++;
        }
      } catch (err) {
        errorCount++;
        console.error('Error importing provider:', provider, err);
      }
    }
    setLoading(false);
    if (errorCount === 0) {
      setImportMessage(`¡Importación exitosa! Se importaron ${successCount} proveedores.`);
    } else {
      setImportMessage(`Importación completada con ${successCount} éxitos y ${errorCount} errores. Revisa la consola para detalles.`);
    }
    setTimeout(() => setImportMessage(null), 6000);
  }, [user, addProvider]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{es.common.loading}</p>
        </div>
      </div>
    );
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
                {es.providers.title}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {es.providers.description}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Botón de agregar movido a la tabla */}
            </div>
          </div>
        </div>



        {/* Spreadsheet Grid */}
        <div className="px-4 sm:px-0">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              💡 <strong>¿Necesitas agregar muchos proveedores?</strong> Usa "Export" para descargar la planilla, 
              completa tus datos y luego "Import" para cargarlos de manera masiva.
            </p>
          </div>
          <DataGrid
              key={`providers-${providers.length}-${Date.now()}`} // Forzar re-render completo
              columns={columns}
              data={providers}
              onDataChange={handleDataChange}
              onAddRow={addingProvider ? undefined : handleAddRow}
              onDeleteRows={handleDeleteRows}
              onExport={handleExport}
              onImport={handleImport}
              searchable={true}
              selectable={true}
              loading={loading || addingProvider}
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
                  ¿Cómo gestionar proveedores?
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Agregar proveedor:</strong> Haz clic en "Agregar" para crear un nuevo proveedor</li>
                    <li><strong>Editar información:</strong> Haz doble clic en cualquier celda para editar los datos</li>
                    <li><strong>Copiar y pegar:</strong> Usa Ctrl+C y Ctrl+V para copiar datos entre celdas</li>
                    <li><strong>Categorías y etiquetas:</strong> Separa múltiples categorías o etiquetas con punto y coma (;)</li>
                    <li><strong>Importar datos:</strong> Usa "Import" para cargar proveedores desde un archivo CSV</li>
                    <li><strong>Exportar datos:</strong> Usa "Export" para descargar tu lista de proveedores</li>
                    <li><strong>Chat con proveedor:</strong> Haz clic en el botón de chat para comunicarte directamente</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* WhatsApp Chat Modal */}
      {selectedProvider && (
        <WhatsAppChat
          providerId={selectedProvider.id}
          providerName={selectedProvider.name}
          providerPhone={selectedProvider.phone}
          isOpen={isWhatsAppOpen}
          onClose={() => {
            setIsWhatsAppOpen(false);
            setSelectedProvider(null);
          }}
        />
      )}
      {importMessage && (
        <div className="fixed top-4 right-4 z-50 bg-blue-100 border border-blue-400 text-blue-800 px-4 py-2 rounded shadow">
          {importMessage}
        </div>
      )}
    </div>
  );
}
