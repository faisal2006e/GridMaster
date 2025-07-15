
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
  const [showColumnChooser, setShowColumnChooser] = useState(false);

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

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, pagination]);

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

  const totalPages = Math.ceil(sortedData.length / pageSize);

  return (
    <div className="grid-container">
      <div className="grid-wrapper">
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
          pageSize={pageSize}
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
