import { Provider } from '../../types';

export const createNewProvider = (): Provider => ({
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
  updatedAt: new Date(),
});

export const processProviderData = (data: any[]): Provider[] => {
  return data.map((row) => ({
    ...row,
    categories:
      typeof row.categories === 'string'
        ? row.categories.split(',').map((c: string) => c.trim())
        : row.categories || [],
    tags:
      typeof row.tags === 'string'
        ? row.tags.split(',').map((t: string) => t.trim())
        : row.tags || [],
    updatedAt: new Date(),
  }));
};

export const handleCatalogUpload = (
  providers: Provider[],
  providerId: string,
  file: File,
): Provider[] => {
  const url = URL.createObjectURL(file);
  return providers.map((p) =>
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
          },
        ],
      }
      : p,
  );
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