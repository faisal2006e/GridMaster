
import React, { useState, useMemo } from 'react';
import { GridProps, SortConfig, FilterConfig } from '../types/grid';
import { GridHeader } from './GridHeader';
import { GridBody } from './GridBody';
import { GridPagination } from './GridPagination';
import './Grid.css';

export const Grid: React.FC<GridProps> = ({
  data,
  columns,
  onRowUpdate,
  pagination = false,
  pageSize = 10,
  editable = false
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({});
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      return Object.entries(filterConfig).every(([field, filterValue]) => {
        if (!filterValue) return true;
        const cellValue = row[field];
        return cellValue?.toString().toLowerCase().includes(filterValue.toLowerCase());
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

  const handleFilter = (field: string, value: string) => {
    setFilterConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1);
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
          />
          <GridBody
            data={paginatedData}
            columns={columns}
            editable={editable}
            onRowUpdate={onRowUpdate}
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
    </div>
  );
};
