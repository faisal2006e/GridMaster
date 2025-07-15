
export interface Column {
  field: string;
  headerName: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  cellRenderer?: (value: any) => string | React.ReactNode;
}

export interface GridProps {
  data: any[];
  columns: Column[];
  onRowUpdate?: (updatedRow: any) => void;
  pagination?: boolean;
  pageSize?: number;
  editable?: boolean;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  [field: string]: string;
}
