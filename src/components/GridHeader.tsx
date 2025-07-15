
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
  setColumns?: (columns: Column[] | ((prev: Column[]) => Column[])) => void;
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
  setColumns,
  showColumnChooser = false
}) => {
  const [activeFilterDropdown, setActiveFilterDropdown] = useState<string | null>(null);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [columnMenuField, setColumnMenuField] = useState<string | null>(null);
  const [columnMenuPosition, setColumnMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [threeDotsMenuField, setThreeDotsMenuField] = useState<string | null>(null);
  const [threeDotsMenuPosition, setThreeDotsMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

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
    if (threeDotsMenuField && onColumnVisibilityChange) {
      // Calculate content width for the specific column
      const columnIndex = columns.findIndex(col => col.field === threeDotsMenuField);
      if (columnIndex !== -1) {
        // Create a temporary element to measure text width
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
          context.font = '14px Arial'; // Default font
          
          // Get all cell values for this column from the DOM
          const cells = document.querySelectorAll(`table.grid-table td:nth-child(${columnIndex + 1})`);
          const headerCell = document.querySelector(`table.grid-table th:nth-child(${columnIndex + 1})`);
          
          let maxWidth = 100; // Minimum width
          
          // Measure header text
          if (headerCell) {
            const headerText = columns[columnIndex].headerName;
            const headerWidth = context.measureText(headerText).width + 60; // Add padding for sort icons
            maxWidth = Math.max(maxWidth, headerWidth);
          }
          
          // Measure cell content
          cells.forEach(cell => {
            const cellText = cell.textContent || '';
            const cellWidth = context.measureText(cellText).width + 24; // Add padding
            maxWidth = Math.max(maxWidth, cellWidth);
          });
          
          // Cap the maximum width to prevent extremely wide columns
          maxWidth = Math.min(maxWidth, 400);
          
          // Update the column width
          setColumns(prev => 
            prev.map(col => 
              col.field === threeDotsMenuField 
                ? { ...col, width: Math.ceil(maxWidth) }
                : col
            )
          );
        }
      }
    }
    handleThreeDotsMenuClose();
  };

  const handleAutosizeAllColumns = () => {
    if (onColumnVisibilityChange) {
      // Create a temporary element to measure text width
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        context.font = '14px Arial'; // Default font
        
        const updatedColumns = columns.map((column, columnIndex) => {
          // Get all cell values for this column from the DOM
          const cells = document.querySelectorAll(`table.grid-table td:nth-child(${columnIndex + 1})`);
          const headerCell = document.querySelector(`table.grid-table th:nth-child(${columnIndex + 1})`);
          
          let maxWidth = 100; // Minimum width
          
          // Measure header text
          if (headerCell) {
            const headerText = column.headerName;
            const headerWidth = context.measureText(headerText).width + 60; // Add padding for sort icons
            maxWidth = Math.max(maxWidth, headerWidth);
          }
          
          // Measure cell content
          cells.forEach(cell => {
            const cellText = cell.textContent || '';
            const cellWidth = context.measureText(cellText).width + 24; // Add padding
            maxWidth = Math.max(maxWidth, cellWidth);
          });
          
          // Cap the maximum width to prevent extremely wide columns
          maxWidth = Math.min(maxWidth, 400);
          
          return { ...column, width: Math.ceil(maxWidth) };
        });
        
        setColumns(updatedColumns);
      }
    }
    handleThreeDotsMenuClose();
  };

  const handlePinColumn = () => {
    // Placeholder for pin column functionality
    console.log('Pin column:', threeDotsMenuField);
    handleThreeDotsMenuClose();
  };

  const handleGroupByColumn = () => {
    if (threeDotsMenuField) {
      // Find the column and add it to group by
      const column = columns.find(col => col.field === threeDotsMenuField);
      if (column) {
        const event = new CustomEvent('groupByColumn', { 
          detail: { field: threeDotsMenuField, headerName: column.headerName }
        });
        window.dispatchEvent(event);
      }
    }
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

  const handleDragStart = (e: React.DragEvent, field: string) => {
    setDraggedColumn(field);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', field);
    
    // Create a custom drag image
    const dragImage = document.createElement('div');
    dragImage.innerHTML = columns.find(col => col.field === field)?.headerName || field;
    dragImage.style.padding = '8px 12px';
    dragImage.style.background = '#007bff';
    dragImage.style.color = 'white';
    dragImage.style.borderRadius = '4px';
    dragImage.style.fontSize = '14px';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    // Clean up drag image after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);

    // Add class to grid container for outside drop zone styling
    const gridContainer = document.querySelector('.grid-container');
    if (gridContainer) {
      gridContainer.classList.add('drag-outside');
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedColumn(null);
    setDragOverColumn(null);

    // Remove class from grid container
    const gridContainer = document.querySelector('.grid-container');
    if (gridContainer) {
      gridContainer.classList.remove('drag-outside');
    }
  };

  const handleDragOver = (e: React.DragEvent, field: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Only set drag over if we're dragging a different column
    if (draggedColumn && draggedColumn !== field) {
      setDragOverColumn(field);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear drag over if we're leaving the entire header cell
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetField: string) => {
    e.preventDefault();
    const draggedField = e.dataTransfer.getData('text/plain');
    
    if (draggedField === targetField || !setColumns || !draggedField) return;

    // Reorder columns
    setColumns(prevColumns => {
      const draggedIndex = prevColumns.findIndex(col => col.field === draggedField);
      const targetIndex = prevColumns.findIndex(col => col.field === targetField);
      
      if (draggedIndex === -1 || targetIndex === -1) return prevColumns;
      
      const newColumns = [...prevColumns];
      const [draggedColumnObj] = newColumns.splice(draggedIndex, 1);
      
      // Insert at the correct position
      if (draggedIndex < targetIndex) {
        newColumns.splice(targetIndex - 1, 0, draggedColumnObj);
      } else {
        newColumns.splice(targetIndex, 0, draggedColumnObj);
      }
      
      return newColumns;
    });
    
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  return (
    <thead>
      <tr>
        {visibleColumns.map(column => (
          <th 
            key={column.field} 
            style={{ width: column.width }}
            className={`grid-header-cell ${dragOverColumn === column.field ? 'drag-over' : ''} ${draggedColumn === column.field ? 'dragging' : ''}`}
            onContextMenu={(e) => handleColumnRightClick(e, column.field)}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, column.field)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, column.field)}
            onDragLeave={(e) => handleDragLeave(e)}
            onDrop={(e) => handleDrop(e, column.field)}
          >
            <div className="header-content">
              <span className="drag-handle" title="Drag to reorder column">⋮⋮</span>
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
              <span>Group by {threeDotsMenuField ? columns.find(col => col.field === threeDotsMenuField)?.headerName : 'Column'}</span>
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
