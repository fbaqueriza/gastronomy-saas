import { Provider } from '../../types';

export const createNewProvider = (): Provider => ({
  id: Date.now().toString(),
  user_id: '', // Debe ser completado por el llamador
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
  defaultDeliveryDays: [],
  defaultDeliveryTime: [],
  defaultPaymentMethod: 'efectivo',
  catalogs: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const processProviderData = (data: any[], user_id: string): Provider[] => {
  return data.map((row) => ({
    ...row,
    user_id,
    categories:
      typeof row.categories === 'string'
        ? row.categories.split(',').map((c: string) => c.trim())
        : row.categories || [],
    tags:
      typeof row.tags === 'string'
        ? row.tags.split(',').map((t: string) => t.trim())
        : row.tags || [],
    defaultDeliveryDays:
      typeof row.defaultDeliveryDays === 'string'
        ? row.defaultDeliveryDays.split(',').map((d: string) => d.trim())
        : row.defaultDeliveryDays || [],
    defaultDeliveryTime: Array.isArray(row.defaultDeliveryTime) ? row.defaultDeliveryTime : (row.defaultDeliveryTime ? [row.defaultDeliveryTime] : []),
    defaultPaymentMethod: row.defaultPaymentMethod || 'efectivo',
    updatedAt: new Date(),
  }));
};

export const handleCatalogUpload = (
  providers: Provider[],
  providerId: string,
  file: File,
): Promise<Provider[]> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updatedProviders = providers.map((p) =>
        p.id === providerId
          ? {
            ...p,
            catalogs: [
              ...p.catalogs,
              {
                id: Date.now().toString(),
                providerId,
                name: file.name,
                fileUrl: dataUrl,
                fileName: file.name,
                fileSize: file.size,
                uploadedAt: new Date(),
              },
            ],
          }
          : p,
      );
      resolve(updatedProviders);
    };
    reader.readAsDataURL(file);
  });
};

export const csvEscape = (value: string): string => {
  if (typeof value !== 'string') return String(value);
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const parseCsvRow = (row: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < row.length) {
    const char = row[i];
    
    if (char === '"') {
      if (inQuotes && i + 1 < row.length && row[i + 1] === '"') {
        current += '"';
        i += 2;
      } else {
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  result.push(current.trim());
  return result;
}; 