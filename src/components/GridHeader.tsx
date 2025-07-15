
import React from 'react';
import { Column, SortConfig, FilterConfig } from '../types/grid';

interface GridHeaderProps {
  columns: Column[];
  sortConfig: SortConfig | null;
  filterConfig: FilterConfig;
  onSort: (field: string) => void;
  onFilter: (field: string, value: string) => void;
}

export const GridHeader: React.FC<GridHeaderProps> = ({
  columns,
  sortConfig,
  filterConfig,
  onSort,
  onFilter
}) => {
  const getSortIcon = (field: string) => {
    if (sortConfig?.field !== field) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <thead>
      <tr>
        {columns.map(column => (
          <th 
            key={column.field} 
            style={{ width: column.width }}
            className="grid-header-cell"
          >
            <div className="header-content">
              <span 
                className={`header-title ${column.sortable ? 'sortable' : ''}`}
                onClick={() => column.sortable && onSort(column.field)}
              >
                {column.headerName}
                {column.sortable && (
                  <span className="sort-icon">{getSortIcon(column.field)}</span>
                )}
              </span>
              
              {column.filterable && (
                <input
                  type="text"
                  placeholder="Filter..."
                  className="filter-input"
                  value={filterConfig[column.field] || ''}
                  onChange={(e) => onFilter(column.field, e.target.value)}
                />
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};
