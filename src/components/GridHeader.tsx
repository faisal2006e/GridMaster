
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
  onColumnVisibilityChange?: (field: string, visible: boolean) => void;
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
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  const getSortIcon = (field: string) => {
    if (sortConfig?.field !== field) return '↑↓';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const visibleColumns = columns.filter(column => column.visible !== false);

  const handleColumnVisibilityToggle = (field: string) => {
    const column = columns.find(col => col.field === field);
    if (column && onColumnVisibilityChange) {
      onColumnVisibilityChange(field, !(column.visible !== false));
    }
  };

  return (
    <thead>
      <tr>
        {showColumnChooser && (
          <th className="grid-header-cell column-chooser-header">
            <div className="column-chooser-container">
              <button 
                className="column-chooser-button"
                onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                title="Choose Columns"
              >
                ☰
              </button>
              {showColumnDropdown && (
                <div className="column-chooser-dropdown">
                  <div className="column-chooser-dropdown-header">
                    <span>Choose Columns</span>
                    <button 
                      className="dropdown-close-button"
                      onClick={() => setShowColumnDropdown(false)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="column-chooser-dropdown-list">
                    {columns.map(column => (
                      <label key={column.field} className="column-dropdown-item">
                        <input
                          type="checkbox"
                          checked={column.visible !== false}
                          onChange={() => handleColumnVisibilityToggle(column.field)}
                        />
                        <span>{column.headerName}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
                      ⋮
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
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};
