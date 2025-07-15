
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
  const [threeDotsMenuField, setThreeDotsMenuField] = useState<string | null>(null);
  const [threeDotsMenuPosition, setThreeDotsMenuPosition] = useState<{ x: number; y: number } | null>(null);

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

  const handleThreeDotsClick = (e: React.MouseEvent, field: string) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setThreeDotsMenuField(field);
    setThreeDotsMenuPosition({ 
      x: rect.left, 
      y: rect.bottom + 2 
    });
  };

  const handleThreeDotsMenuClose = () => {
    setThreeDotsMenuField(null);
    setThreeDotsMenuPosition(null);
  };

  const handleSortDescending = () => {
    if (threeDotsMenuField) {
      onSort(threeDotsMenuField);
      if (setSortConfig) {
        setSortConfig({ field: threeDotsMenuField, direction: 'desc' });
      }
    }
    handleThreeDotsMenuClose();
  };

  const handleAutosizeColumn = () => {
    // Placeholder for autosize functionality
    console.log('Autosize column:', threeDotsMenuField);
    handleThreeDotsMenuClose();
  };

  const handleAutosizeAllColumns = () => {
    // Placeholder for autosize all functionality
    console.log('Autosize all columns');
    handleThreeDotsMenuClose();
  };

  const handlePinColumn = () => {
    // Placeholder for pin column functionality
    console.log('Pin column:', threeDotsMenuField);
    handleThreeDotsMenuClose();
  };

  const handleGroupByColumn = () => {
    // Placeholder for group by functionality
    console.log('Group by column:', threeDotsMenuField);
    handleThreeDotsMenuClose();
  };

  const handleResetColumns = () => {
    // Reset all columns to visible
    columns.forEach(column => {
      if (onColumnVisibilityChange) {
        onColumnVisibilityChange(column.field, true);
      }
    });
    handleThreeDotsMenuClose();
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
                      onClick={(e) => handleThreeDotsClick(e, column.field)}
                      title="Column Options"
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
      
      {/* Three Dots Menu */}
      {threeDotsMenuField && threeDotsMenuPosition && (
        <div className="column-context-menu-overlay" onClick={handleThreeDotsMenuClose}>
          <div 
            className="three-dots-context-menu"
            style={{ 
              left: threeDotsMenuPosition.x, 
              top: threeDotsMenuPosition.y 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="column-menu-item" onClick={() => {
              onSort(threeDotsMenuField);
              if (setSortConfig) {
                setSortConfig({ field: threeDotsMenuField, direction: 'asc' });
              }
              handleThreeDotsMenuClose();
            }}>
              <span className="column-menu-icon">↑</span>
              <span>Sort Ascending</span>
            </div>
            <div className="column-menu-item" onClick={handleSortDescending}>
              <span className="column-menu-icon">↓</span>
              <span>Sort Descending</span>
            </div>
            <div className="column-menu-item" onClick={() => {
              if (setSortConfig) {
                setSortConfig(null);
              }
              handleThreeDotsMenuClose();
            }}>
              <span className="column-menu-icon">◇</span>
              <span>Clear Sort</span>
            </div>
            <div className="column-menu-divider"></div>
            <div className="column-menu-item" onClick={() => {
              setActiveFilterDropdown(threeDotsMenuField);
              handleThreeDotsMenuClose();
            }}>
              <span className="column-menu-icon">🔍</span>
              <span>Filter</span>
            </div>
            <div className="column-menu-divider"></div>
            <div className="column-menu-item" onClick={handlePinColumn}>
              <span className="column-menu-icon">📌</span>
              <span>Pin Column</span>
              <span className="column-menu-arrow">▶</span>
            </div>
            <div className="column-menu-divider"></div>
            <div className="column-menu-item" onClick={handleAutosizeColumn}>
              <span className="column-menu-icon">↔</span>
              <span>Autosize This Column</span>
            </div>
            <div className="column-menu-item" onClick={handleAutosizeAllColumns}>
              <span className="column-menu-icon">↔</span>
              <span>Autosize All Columns</span>
            </div>
            <div className="column-menu-divider"></div>
            <div className="column-menu-item" onClick={handleGroupByColumn}>
              <span className="column-menu-icon">≡</span>
              <span>Group by Total Value</span>
            </div>
            <div className="column-menu-divider"></div>
            <div className="column-menu-item" onClick={() => {
              setShowColumnDropdown(true);
              handleThreeDotsMenuClose();
            }}>
              <span className="column-menu-icon">☰</span>
              <span>Choose Columns</span>
            </div>
            <div className="column-menu-item" onClick={handleResetColumns}>
              <span className="column-menu-icon">↺</span>
              <span>Reset Columns</span>
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
