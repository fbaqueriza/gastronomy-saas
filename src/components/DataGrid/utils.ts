import { Column } from './types';

export const filterDataBySearchTerm = (data: any[], searchTerm: string): any[] => {
  if (!searchTerm) return data;

  return data.filter((row) => {
    // Búsqueda en valores directos del row
    const directMatch = Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Búsqueda en proveedores si están disponibles
    if (row.providers && Array.isArray(row.providers)) {
      const providerMatch = row.providers.some((provider: any) =>
        provider.name && provider.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (providerMatch) return true;
    }

    // Búsqueda en proveedores asociados y preferidos
    if (row.associatedProviders) {
      const associatedMatch = Array.isArray(row.associatedProviders) 
        ? row.associatedProviders.some((provider: any) =>
            String(provider).toLowerCase().includes(searchTerm.toLowerCase())
          )
        : String(row.associatedProviders).toLowerCase().includes(searchTerm.toLowerCase());
      if (associatedMatch) return true;
    }

    if (row.preferredProvider) {
      const preferredMatch = String(row.preferredProvider).toLowerCase().includes(searchTerm.toLowerCase());
      if (preferredMatch) return true;
    }

    return directMatch;
  });
};

export const generateCSVContent = (
  data: any[],
  columns: Column[],
  selectedRows: Set<string>,
): string => {
  const selectedData = data.filter((row) =>
    selectedRows.has(row.id || row.toString()),
  );

  if (selectedData.length === 0) return '';

  return [
    columns.map((col) => col.name).join('\t'),
    ...selectedData.map((row) =>
      columns.map((col) => row[col.key] || '').join('\t'),
    ),
  ].join('\n');
};

export const parsePastedData = (
  text: string,
  columns: Column[],
): any[] => {
  return text.split('\n').map((row) =>
    row.split('\t').reduce((obj, value, idx) => {
      obj[columns[idx]?.key || `col${idx}`] = value;
      return obj;
    }, {} as any),
  );
};

export const updateRowData = (
  data: any[],
  rowId: string,
  columnKey: string,
  newValue: string,
): any[] => {
  const newData = [...data];
  const rowIndex = newData.findIndex((r) => r.id === rowId);
  
  if (rowIndex !== -1) {
    newData[rowIndex] = {
      ...newData[rowIndex],
      [columnKey]: newValue,
    };
  }
  
  return newData;
}; 