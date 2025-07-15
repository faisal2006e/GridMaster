
import React, { useState, useMemo } from 'react';
import { GridProps, SortConfig, FilterConfig, FilterOperator } from '../types/grid';
import { GridHeader } from './GridHeader';
import { GridBody } from './GridBody';
import { GridPagination } from './GridPagination';
import { ColumnChooser } from './ColumnChooser';
import './Grid.css';

export const Grid: React.FC<GridProps> = ({
  data,
  columns: initialColumns,
  onRowUpdate,
  pagination = false,
  pageSize = 10,
  editable = false,
  columnChooser = false
}) => {
  const [columns, setColumns] = useState(initialColumns.map(col => ({ ...col, visible: col.visible !== false })));
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [showColumnChooser, setShowColumnChooser] = useState(false);
  const [groupByColumns, setGroupByColumns] = useState<Array<{field: string, headerName: string}>>([]);

  // Listen for group by events
  React.useEffect(() => {
    const handleGroupByColumn = (event: CustomEvent) => {
      const { field, headerName } = event.detail;
      setGroupByColumns(prev => {
        // Check if column is already grouped
        if (prev.some(col => col.field === field)) {
          return prev;
        }
        return [...prev, { field, headerName }];
      });
    };

    window.addEventListener('groupByColumn', handleGroupByColumn as EventListener);
    return () => window.removeEventListener('groupByColumn', handleGroupByColumn as EventListener);
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      return Object.entries(filterConfig).every(([field, filter]) => {
        if (!filter?.value) return true;
        
        const cellValue = row[field]?.toString().toLowerCase() || '';
        const filterValue = filter.value.toLowerCase();
        
        switch (filter.operator) {
          case 'contains':
            return cellValue.includes(filterValue);
          case 'notContains':
            return !cellValue.includes(filterValue);
          case 'like':
            return cellValue.includes(filterValue);
          case 'notLike':
            return !cellValue.includes(filterValue);
          case 'equals':
            return cellValue === filterValue;
          case 'notEquals':
            return cellValue !== filterValue;
          case 'startsWith':
            return cellValue.startsWith(filterValue);
          case 'endsWith':
            return cellValue.endsWith(filterValue);
          default:
            return cellValue.includes(filterValue);
        }
      });
    });
  }, [data, filterConfig]);

  const groupedData = useMemo(() => {
    if (groupByColumns.length === 0) return filteredData;

    const groups: { [key: string]: any[] } = {};
    
    filteredData.forEach(row => {
      const groupKey = groupByColumns.map(col => row[col.field] || 'Unknown').join(' | ');
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(row);
    });

    const result: any[] = [];
    Object.entries(groups).forEach(([groupKey, groupRows]) => {
      // Add group header row
      result.push({
        __isGroupHeader: true,
        __groupKey: groupKey,
        __groupCount: groupRows.length,
        __groupColumns: groupByColumns
      });
      // Add group rows
      result.push(...groupRows);
    });

    return result;
  }, [filteredData, groupByColumns]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return groupedData;
    
    return [...groupedData].sort((a, b) => {
      // Don't sort group headers
      if (a.__isGroupHeader || b.__isGroupHeader) return 0;
      
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [groupedData, sortConfig]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (currentPage - 1) * currentPageSize;
    const endIndex = startIndex + currentPageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, currentPageSize, pagination]);

  const handleSort = (field: string) => {
    setSortConfig(prevSort => {
      if (prevSort?.field === field) {
        return prevSort.direction === 'asc' 
          ? { field, direction: 'desc' }
          : null;
      }
      return { field, direction: 'asc' };
    });
  };

  const handleFilter = (field: string, value: string, operator: FilterOperator) => {
    setFilterConfig(prev => ({
      ...prev,
      [field]: value ? { value, operator } : undefined
    }));
    setCurrentPage(1);
  };

  const handleColumnVisibilityChange = (field: string, visible: boolean) => {
    setColumns(prev => 
      prev.map(col => 
        col.field === field ? { ...col, visible } : col
      )
    );
  };

  const handleRemoveGroupBy = (field: string) => {
    setGroupByColumns(prev => prev.filter(col => col.field !== field));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setCurrentPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const totalPages = Math.ceil(sortedData.length / currentPageSize);

  return (
    <div 
      className="grid-container"
      onDragOver={(e) => {
        // Check if we're outside the grid table area
        const gridTable = document.querySelector('.grid-table');
        if (gridTable) {
          const rect = gridTable.getBoundingClientRect();
          const isOutside = e.clientY < rect.top || e.clientY > rect.bottom || 
                           e.clientX < rect.left || e.clientX > rect.right;
          
          if (isOutside) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          }
        }
      }}
      onDrop={(e) => {
        // Check if we're outside the grid table area
        const gridTable = document.querySelector('.grid-table');
        if (gridTable) {
          const rect = gridTable.getBoundingClientRect();
          const isOutside = e.clientY < rect.top || e.clientY > rect.bottom || 
                           e.clientX < rect.left || e.clientX > rect.right;
          
          if (isOutside) {
            e.preventDefault();
            const draggedField = e.dataTransfer.getData('text/plain');
            
            if (draggedField) {
              handleColumnVisibilityChange(draggedField, false);
            }
          }
        }
      }}
    >
      <div className="grid-wrapper">
        <div 
          className="grid-drag-area"
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            e.currentTarget.classList.add('drag-over');
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove('drag-over');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('drag-over');
            const draggedField = e.dataTransfer.getData('text/plain');
            const draggedColumn = columns.find(col => col.field === draggedField);
            
            if (draggedColumn) {
              setGroupByColumns(prev => {
                // Check if column is already grouped
                if (prev.some(col => col.field === draggedField)) {
                  return prev;
                }
                return [...prev, { field: draggedField, headerName: draggedColumn.headerName }];
              });
            }
          }}
        >
          {groupByColumns.length === 0 ? (
            <>
              <span className="drag-icon">☰</span>
              <span className="drag-text">Drag here to set row groups</span>
            </>
          ) : (
            <div className="drag-area-groups">
              <span className="drag-icon">☰</span>
              <span className="drag-text">Row groups:</span>
              {groupByColumns.map(col => (
                <div key={col.field} className="drag-area-group-tag">
                  <span>{col.headerName}</span>
                  <button 
                    className="drag-area-group-remove"
                    onClick={() => handleRemoveGroupBy(col.field)}
                    title={`Remove ${col.headerName} grouping`}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button 
                className="drag-area-clear-all"
                onClick={() => setGroupByColumns([])}
                title="Clear all grouping"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
        <table className="grid-table">
          <GridHeader
            columns={columns}
            sortConfig={sortConfig}
            filterConfig={filterConfig}
            onSort={handleSort}
            onFilter={handleFilter}
            onColumnChooserOpen={() => setShowColumnChooser(true)}
            onColumnVisibilityChange={handleColumnVisibilityChange}
            setSortConfig={setSortConfig}
            setColumns={setColumns}
            showColumnChooser={columnChooser}
          />
          <GridBody
            data={paginatedData}
            columns={columns}
            editable={editable}
            onRowUpdate={onRowUpdate}
            showColumnChooser={columnChooser}
          />
        </table>
      </div>
      
      {pagination && (
        <GridPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={sortedData.length}
          pageSize={currentPageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
      
      {showColumnChooser && (
        <ColumnChooser
          columns={columns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          onClose={() => setShowColumnChooser(false)}
        />
      )}
    </div>
  );
};
