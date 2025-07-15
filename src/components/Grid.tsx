
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
      
      // Hide the column from the grid when added to group by
      handleColumnVisibilityChange(field, false);
    };

    window.addEventListener('groupByColumn', handleGroupByColumn as EventListener);
    return () => window.removeEventListener('groupByColumn', handleGroupByColumn as EventListener);
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      return Object.entries(filterConfig).every(([field, filter]) => {
        if (!filter?.conditions || filter.conditions.length === 0) return true;
        
        const cellValue = row[field]?.toString().toLowerCase() || '';
        
        const evaluateCondition = (condition: any) => {
          const column = columns.find(col => col.field === field);
          const originalValue = row[field];
          const filterValue = condition.value;
          
          // Handle blank/not blank operators
          if (condition.operator === 'blank') {
            return originalValue == null || originalValue === '' || originalValue === undefined;
          }
          if (condition.operator === 'notBlank') {
            return originalValue != null && originalValue !== '' && originalValue !== undefined;
          }
          
          // Handle numeric operators
          if (column?.dataType === 'number') {
            const numValue = Number(originalValue);
            const numFilterValue = Number(filterValue);
            
            if (isNaN(numValue) || isNaN(numFilterValue)) {
              return false;
            }
            
            switch (condition.operator) {
              case 'equals':
                return numValue === numFilterValue;
              case 'notEquals':
                return numValue !== numFilterValue;
              case 'greaterThan':
                return numValue > numFilterValue;
              case 'greaterThanOrEqual':
                return numValue >= numFilterValue;
              case 'lessThan':
                return numValue < numFilterValue;
              case 'lessThanOrEqual':
                return numValue <= numFilterValue;
              default:
                return false;
            }
          }
          
          // Handle date, time, and datetime operators
          if (column?.dataType === 'date' || column?.dataType === 'time' || column?.dataType === 'datetime') {
            const dateValue = new Date(originalValue);
            const filterDateValue = new Date(filterValue);
            
            if (isNaN(dateValue.getTime()) || isNaN(filterDateValue.getTime())) {
              return false;
            }
            
            switch (condition.operator) {
              case 'equals':
                return dateValue.getTime() === filterDateValue.getTime();
              case 'notEquals':
                return dateValue.getTime() !== filterDateValue.getTime();
              case 'greaterThan':
                return dateValue.getTime() > filterDateValue.getTime();
              case 'greaterThanOrEqual':
                return dateValue.getTime() >= filterDateValue.getTime();
              case 'lessThan':
                return dateValue.getTime() < filterDateValue.getTime();
              case 'lessThanOrEqual':
                return dateValue.getTime() <= filterDateValue.getTime();
              default:
                return false;
            }
          }
          
          // Handle boolean operators  
          if (column?.dataType === 'boolean') {
            const boolValue = Boolean(originalValue);
            const filterBoolValue = filterValue.toLowerCase() === 'true';
            
            switch (condition.operator) {
              case 'equals':
                return boolValue === filterBoolValue;
              case 'notEquals':
                return boolValue !== filterBoolValue;
              default:
                return false;
            }
          }
          
          // Handle string operators (default)
          switch (condition.operator) {
            case 'contains':
              return cellValue.includes(filterValue.toLowerCase());
            case 'notContains':
              return !cellValue.includes(filterValue.toLowerCase());
            case 'equals':
              return cellValue === filterValue.toLowerCase();
            case 'notEquals':
              return cellValue !== filterValue.toLowerCase();
            case 'startsWith':
              return cellValue.startsWith(filterValue.toLowerCase());
            case 'endsWith':
              return cellValue.endsWith(filterValue.toLowerCase());
            case 'like':
              const likeRegex = new RegExp(filterValue.toLowerCase().replace(/\*/g, '.*'), 'i');
              return likeRegex.test(cellValue);
            case 'notLike':
              const notLikeRegex = new RegExp(filterValue.toLowerCase().replace(/\*/g, '.*'), 'i');
              return !notLikeRegex.test(cellValue);
            default:
              return false;
          }
              case 'greaterThanOrEqual':
                return numValue >= numFilterValue;
              case 'lessThan':
                return numValue < numFilterValue;
              case 'lessThanOrEqual':
                return numValue <= numFilterValue;
              default:
                return numValue === numFilterValue;
            }
          }
          
          // Handle string operators
          const stringValue = cellValue;
          const stringFilterValue = filterValue.toLowerCase();
          
          switch (condition.operator) {
            case 'contains':
              return stringValue.includes(stringFilterValue);
            case 'notContains':
              return !stringValue.includes(stringFilterValue);
            case 'like':
              return stringValue.includes(stringFilterValue);
            case 'notLike':
              return !stringValue.includes(stringFilterValue);
            case 'equals':
              return stringValue === stringFilterValue;
            case 'notEquals':
              return stringValue !== stringFilterValue;
            case 'startsWith':
              return stringValue.startsWith(stringFilterValue);
            case 'endsWith':
              return stringValue.endsWith(stringFilterValue);
            default:
              return stringValue.includes(stringFilterValue);
          }
        };
        
        if (filter.logic === 'OR') {
          return filter.conditions.some(evaluateCondition);
        } else {
          return filter.conditions.every(evaluateCondition);
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

  const handleFilter = (field: string, conditions: any[], logic: any) => {
    setFilterConfig(prev => ({
      ...prev,
      [field]: conditions.length > 0 ? { conditions, logic } : undefined
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
    // Show the column back in the grid when removed from group by
    handleColumnVisibilityChange(field, true);
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
            // Only remove drag-over if we're actually leaving the drop zone
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              e.currentTarget.classList.remove('drag-over');
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('drag-over');
            
            console.log('Drop event fired in group area');
            
            // Try to get column data from different data transfer types
            let columnData = null;
            
            try {
              const columnJson = e.dataTransfer.getData('application/column');
              console.log('Column JSON:', columnJson);
              if (columnJson) {
                columnData = JSON.parse(columnJson);
              }
            } catch (error) {
              console.log('Error parsing JSON, trying fallback');
              // Fallback to plain text
              const draggedField = e.dataTransfer.getData('text/plain');
              console.log('Dragged field:', draggedField);
              const draggedColumn = columns.find(col => col.field === draggedField);
              if (draggedColumn) {
                columnData = {
                  field: draggedField,
                  headerName: draggedColumn.headerName
                };
              }
            }
            
            console.log('Final column data:', columnData);
            
            if (columnData) {
              setGroupByColumns(prev => {
                // Check if column is already grouped
                if (prev.some(col => col.field === columnData.field)) {
                  return prev;
                }
                return [...prev, { field: columnData.field, headerName: columnData.headerName }];
              });
              
              // Hide the column from the grid when added to group by
              handleColumnVisibilityChange(columnData.field, false);
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
                onClick={() => {
                  // Show all grouped columns back in the grid
                  groupByColumns.forEach(col => {
                    handleColumnVisibilityChange(col.field, true);
                  });
                  setGroupByColumns([]);
                }}
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
