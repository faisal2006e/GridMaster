import React, { useState } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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

interface DragItem {
  type: string;
  field: string;
  index: number;
}

const COLUMN_TYPE = 'column';

const DraggableHeaderCell: React.FC<{
  column: Column;
  index: number;
  moveColumn: (fromIndex: number, toIndex: number) => void;
  children: React.ReactNode;
}> = ({ column, index, moveColumn, children }) => {
  const [{ isDragging }, drag, preview] = useDrag({
    type: COLUMN_TYPE,
    item: { type: COLUMN_TYPE, field: column.field, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: COLUMN_TYPE,
    drop: (item: DragItem) => {
      if (item.index !== index) {
        moveColumn(item.index, index);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <th
      ref={(node) => {
        preview(node);
        drop(node);
      }}
      style={{ 
        width: column.width,
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isOver ? '#e3f2fd' : undefined,
        borderLeft: isOver ? '3px solid #007bff' : undefined,
      }}
      className={`grid-header-cell ${isOver ? 'drag-over' : ''} ${isDragging ? 'dragging' : ''}`}
    >
      <div className="header-content">
        <span 
          ref={drag}
          className="drag-handle" 
          title="Drag to reorder column or group by"
          style={{ cursor: 'grab' }}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('text/plain', column.field);
            e.dataTransfer.setData('application/column', JSON.stringify({
              field: column.field,
              headerName: column.headerName
            }));
          }}
        >
          ⋮⋮
        </span>
        {children}
      </div>
    </th>
  );
};

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

  const getSortIcon = (field: string) => {
    if (sortConfig?.field !== field) return '↑↓';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const visibleColumns = columns.filter(column => column.visible !== false);

  const moveColumn = (fromIndex: number, toIndex: number) => {
    if (setColumns) {
      setColumns(prevColumns => {
        const newColumns = [...prevColumns];
        const [movedColumn] = newColumns.splice(fromIndex, 1);
        newColumns.splice(toIndex, 0, movedColumn);
        return newColumns;
      });
    }
  };

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
      const columnIndex = columns.findIndex(col => col.field === threeDotsMenuField);
      if (columnIndex !== -1) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
          context.font = '14px Arial';

          const cells = document.querySelectorAll(`table.grid-table td:nth-child(${columnIndex + 1})`);
          const headerCell = document.querySelector(`table.grid-table th:nth-child(${columnIndex + 1})`);

          let maxWidth = 100;

          if (headerCell) {
            const headerText = columns[columnIndex].headerName;
            const headerWidth = context.measureText(headerText).width + 60;
            maxWidth = Math.max(maxWidth, headerWidth);
          }

          cells.forEach(cell => {
            const cellText = cell.textContent || '';
            const cellWidth = context.measureText(cellText).width + 24;
            maxWidth = Math.max(maxWidth, cellWidth);
          });

          maxWidth = Math.min(maxWidth, 400);

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
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        context.font = '14px Arial';

        const updatedColumns = columns.map((column, columnIndex) => {
          const cells = document.querySelectorAll(`table.grid-table td:nth-child(${columnIndex + 1})`);
          const headerCell = document.querySelector(`table.grid-table th:nth-child(${columnIndex + 1})`);

          let maxWidth = 100;

          if (headerCell) {
            const headerText = column.headerName;
            const headerWidth = context.measureText(headerText).width + 60;
            maxWidth = Math.max(maxWidth, headerWidth);
          }

          cells.forEach(cell => {
            const cellText = cell.textContent || '';
            const cellWidth = context.measureText(cellText).width + 24;
            maxWidth = Math.max(maxWidth, cellWidth);
          });

          maxWidth = Math.min(maxWidth, 400);

          return { ...column, width: Math.ceil(maxWidth) };
        });

        setColumns(updatedColumns);
      }
    }
    handleThreeDotsMenuClose();
  };

  const handlePinColumn = () => {
    console.log('Pin column:', threeDotsMenuField);
    handleThreeDotsMenuClose();
  };

  const handleGroupByColumn = () => {
    if (threeDotsMenuField) {
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
    columns.forEach(column => {
      if (onColumnVisibilityChange) {
        onColumnVisibilityChange(column.field, true);
      }
    });
    handleThreeDotsMenuClose();
  };

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <thead>
          <tr>
            {visibleColumns.map((column, index) => (
              <DraggableHeaderCell
                key={column.field}
                column={column}
                index={index}
                moveColumn={moveColumn}
              >
                <span 
                  className={`header-title ${column.sortable ? 'sortable' : ''}`}
                  onClick={() => column.sortable && onSort(column.field)}
                  onContextMenu={(e) => handleColumnRightClick(e, column.field)}
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
              </DraggableHeaderCell>
            ))}
          </tr>
        </thead>
      </DndProvider>

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
    </>
  );
};