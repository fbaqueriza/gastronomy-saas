import { Column } from './types';

export const filterDataBySearchTerm = (data: any[], searchTerm: string): any[] => {
  if (!searchTerm) return data;

  return data.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );
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