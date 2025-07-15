
export interface Column {
  field: string;
  headerName: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  cellRenderer?: (value: any) => string | React.ReactNode;
  visible?: boolean;
}

export interface GridProps {
  data: any[];
  columns: Column[];
  onRowUpdate?: (updatedRow: any) => void;
  pagination?: boolean;
  pageSize?: number;
  editable?: boolean;
  columnChooser?: boolean;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export type FilterOperator = 'contains' | 'notContains' | 'like' | 'notLike' | 'equals' | 'notEquals' | 'startsWith' | 'endsWith';

export interface FilterConfig {
  [field: string]: {
    value: string;
    operator: FilterOperator;
  };
}
