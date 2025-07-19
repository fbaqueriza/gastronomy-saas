import { Provider } from '../../types';

export interface ProviderColumn {
  key: keyof Provider;
  name: string;
  width?: number;
  editable?: boolean;
  render?: (value: any, rowData: Provider) => React.ReactNode;
}

export interface CatalogFile {
  id: string;
  providerId: string;
  name: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
} 