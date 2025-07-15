
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
  setSortConfig?: (config: SortConfig | null) => void;
  showColumnChooser?: boolean;
}

export const GridHeader: React.FC<GridHeaderProps> = ({
  columns,
  sortConfig,
  filterConfig,
  onSort,
  onFilter,
  onColumnChooserOpen,
  onColumnVisibilityChange,
  setSortConfig,
  showColumnChooser = false
}) => {
  const [activeFilterDropdown, setActiveFilterDropdown] = useState<string | null>(null);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [columnMenuField, setColumnMenuField] = useState<string | null>(null);
  const [columnMenuPosition, setColumnMenuPosition] = useState<{ x: number; y: number } | null>(null);

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

  const handleColumnRightClick = (e: React.MouseEvent, field: string) => {
    e.preventDefault();
    setColumnMenuField(field);
    setColumnMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const handleColumnMenuClose = () => {
    setColumnMenuField(null);
    setColumnMenuPosition(null);
  };

  const handleSortAscending = () => {
    if (columnMenuField) {
      onSort(columnMenuField);
      if (setSortConfig) {
        setSortConfig({ field: columnMenuField, direction: 'asc' });
      }
    }
    handleColumnMenuClose();
  };

  const handleClearSort = () => {
    if (setSortConfig) {
      setSortConfig(null);
    }
    handleColumnMenuClose();
  };

  const handleColumnChooserFromMenu = () => {
    setShowColumnDropdown(true);
    handleColumnMenuClose();
  };

  return (
    <thead>
      <tr>
        {visibleColumns.map(column => (
          <th 
            key={column.field} 
            style={{ width: column.width }}
            className="grid-header-cell"
            onContextMenu={(e) => handleColumnRightClick(e, column.field)}
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
      
      {/* Column Context Menu */}
      {columnMenuField && columnMenuPosition && (
        <div className="column-context-menu-overlay" onClick={handleColumnMenuClose}>
          <div 
            className="column-context-menu"
            style={{ 
              left: columnMenuPosition.x, 
              top: columnMenuPosition.y 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="column-menu-item" onClick={handleSortAscending}>
              <span className="column-menu-icon">↑</span>
              <span>Sort Ascending</span>
            </div>
            <div className="column-menu-item" onClick={handleClearSort}>
              <span className="column-menu-icon">◇</span>
              <span>Clear Sort</span>
            </div>
            <div className="column-menu-divider"></div>
            <div className="column-menu-item" onClick={handleColumnChooserFromMenu}>
              <span className="column-menu-icon">☰</span>
              <span>Choose Columns</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Column Chooser Dropdown */}
      {showColumnDropdown && (
        <div className="column-chooser-overlay" onClick={() => setShowColumnDropdown(false)}>
          <div className="column-chooser-dropdown-standalone" onClick={(e) => e.stopPropagation()}>
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
        </div>
      )}
    </thead>
  );
};
