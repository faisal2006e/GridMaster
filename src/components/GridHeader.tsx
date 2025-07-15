
import React, { useState } from 'react';
import { Column, SortConfig, FilterConfig, FilterOperator } from '../types/grid';
import { FilterDropdown } from './FilterDropdown';

interface GridHeaderProps {
  columns: Column[];
  sortConfig: SortConfig | null;
  filterConfig: FilterConfig;
  onSort: (field: string) => void;
  onFilter: (field: string, value: string, operator: FilterOperator) => void;
  onColumnChooserOpen?: () => void;
  showColumnChooser?: boolean;
}

export const GridHeader: React.FC<GridHeaderProps> = ({
  columns,
  sortConfig,
  filterConfig,
  onSort,
  onFilter,
  onColumnChooserOpen,
  showColumnChooser = false
}) => {
  const [activeFilterDropdown, setActiveFilterDropdown] = useState<string | null>(null);

  const getSortIcon = (field: string) => {
    if (sortConfig?.field !== field) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const visibleColumns = columns.filter(column => column.visible !== false);

  return (
    <thead>
      <tr>
        {showColumnChooser && (
          <th className="grid-header-cell column-chooser-header">
            <button 
              className="column-chooser-button"
              onClick={onColumnChooserOpen}
              title="Choose Columns"
            >
              ⚙️
            </button>
          </th>
        )}
        {visibleColumns.map(column => (
          <th 
            key={column.field} 
            style={{ width: column.width }}
            className="grid-header-cell"
          >
            <div className="header-content">
              <div className="header-title-row">
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
                  <div className="filter-controls">
                    <button
                      className={`filter-menu-button ${filterConfig[column.field]?.value ? 'active' : ''}`}
                      onClick={() => setActiveFilterDropdown(
                        activeFilterDropdown === column.field ? null : column.field
                      )}
                      title="Filter"
                    >
                      🔍
                    </button>
                    {activeFilterDropdown === column.field && (
                      <FilterDropdown
                        field={column.field}
                        filterConfig={filterConfig}
                        onFilterChange={onFilter}
                        onClose={() => setActiveFilterDropdown(null)}
                      />
                    )}
                  </div>
                )}
              </div>
              
              {column.filterable && filterConfig[column.field]?.value && (
                <div className="active-filter-indicator">
                  <span className="filter-operator-label">
                    {filterConfig[column.field].operator}
                  </span>
                  <span className="filter-value-label">
                    "{filterConfig[column.field].value}"
                  </span>
                  <button
                    className="clear-filter-button"
                    onClick={() => onFilter(column.field, '', 'contains')}
                    title="Clear filter"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};
