
export interface Column {
  field: string;
  headerName: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  cellRenderer?: (value: any) => string | React.ReactNode;
  visible?: boolean;
  dataType?: 'string' | 'number' | 'date' | 'time' | 'datetime' | 'boolean';
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

export type FilterOperator = 'contains' | 'notContains' | 'like' | 'notLike' | 'equals' | 'notEquals' | 'startsWith' | 'endsWith' | 'greaterThan' | 'greaterThanOrEqual' | 'lessThan' | 'lessThanOrEqual' | 'between' | 'blank' | 'notBlank';

export type FilterCondition = {
  value: string;
  operator: FilterOperator;
  id: string;
};

export type FilterLogic = 'AND' | 'OR';

export interface FilterConfig {
  [field: string]: {
    conditions: FilterCondition[];
    logic: FilterLogic;
  };
}
