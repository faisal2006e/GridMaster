
import React, { useState, useRef, useEffect } from 'react';
import { FilterOperator, FilterConfig } from '../types/grid';

interface FilterDropdownProps {
  field: string;
  filterConfig: FilterConfig;
  onFilterChange: (field: string, value: string, operator: FilterOperator) => void;
  onClose: () => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  field,
  filterConfig,
  onFilterChange,
  onClose
}) => {
  const [value, setValue] = useState(filterConfig[field]?.value || '');
  const [operator, setOperator] = useState<FilterOperator>(filterConfig[field]?.operator || 'contains');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const filterOperators: { value: FilterOperator; label: string }[] = [
    { value: 'contains', label: 'Contains' },
    { value: 'notContains', label: 'Not Contains' },
    { value: 'like', label: 'Like' },
    { value: 'notLike', label: 'Not Like' },
    { value: 'equals', label: 'Equals' },
    { value: 'notEquals', label: 'Not Equals' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' }
  ];

  const handleApply = () => {
    onFilterChange(field, value, operator);
    onClose();
  };

  const handleClear = () => {
    setValue('');
    onFilterChange(field, '', operator);
    onClose();
  };

  return (
    <div ref={dropdownRef} className="filter-dropdown">
      <div className="filter-dropdown-content">
        <div className="filter-operator-section">
          <label>Filter Type:</label>
          <select 
            value={operator} 
            onChange={(e) => setOperator(e.target.value as FilterOperator)}
            className="filter-operator-select"
          >
            {filterOperators.map(op => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-value-section">
          <label>Value:</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter filter value..."
            className="filter-value-input"
          />
        </div>
        
        <div className="filter-actions">
          <button className="filter-button apply" onClick={handleApply}>Apply</button>
          <button className="filter-button clear" onClick={handleClear}>Clear</button>
        </div>
      </div>
    </div>
  );
};
