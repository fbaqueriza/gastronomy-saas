export interface Column {
  key: string;
  name: string;
  width?: number;
  editable?: boolean;
  render?: (value: any, rowData: any, extra?: any) => React.ReactNode;
}

export interface DataGridProps {
  columns: Column[];
  data: any[];
  onDataChange: (newData: any[]) => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
  onAddRow?: () => void;
  onDeleteRows?: (selectedRows: any[]) => void;
  searchable?: boolean;
  selectable?: boolean;
  loading?: boolean;
}

export interface EditingCell {
  rowId: string;
  columnKey: string;
} 