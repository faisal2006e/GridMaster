
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FilterOperator, FilterConfig, FilterCondition, FilterLogic } from '../types/grid';

interface FilterDropdownProps {
  field: string;
  column: { field: string; dataType?: string };
  filterConfig: FilterConfig;
  onFilterChange: (field: string, conditions: FilterCondition[], logic: FilterLogic) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  field,
  column,
  filterConfig,
  onFilterChange,
  onClose,
  position
}) => {
  const currentFilter = filterConfig[field];
  const defaultOperator = column.dataType === 'number' ? 'equals' : 'contains';
  const [conditions, setConditions] = useState<FilterCondition[]>(
    currentFilter?.conditions || [{ id: Date.now().toString(), value: '', operator: defaultOperator }]
  );
  const [logic, setLogic] = useState<FilterLogic>(currentFilter?.logic || 'AND');
  const filterOperators = getFilterOperators(column.dataType);
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

  const getFilterOperators = (dataType: string = 'string'): { value: FilterOperator; label: string }[] => {
    if (dataType === 'number') {
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'notEquals', label: 'Does not equal' },
        { value: 'greaterThan', label: 'Greater than' },
        { value: 'greaterThanOrEqual', label: 'Greater than or equal to' },
        { value: 'lessThan', label: 'Less than' },
        { value: 'lessThanOrEqual', label: 'Less than or equal to' },
        { value: 'between', label: 'Between' },
        { value: 'blank', label: 'Blank' },
        { value: 'notBlank', label: 'Not blank' }
      ];
    }
    
    // Default string operators
    return [
      { value: 'contains', label: 'Contains' },
      { value: 'notContains', label: 'Not Contains' },
      { value: 'like', label: 'Like' },
      { value: 'notLike', label: 'Not Like' },
      { value: 'equals', label: 'Equals' },
      { value: 'notEquals', label: 'Not Equals' },
      { value: 'startsWith', label: 'Starts With' },
      { value: 'endsWith', label: 'Ends With' },
      { value: 'blank', label: 'Blank' },
      { value: 'notBlank', label: 'Not blank' }
    ];
  };

  const addCondition = () => {
    const newCondition: FilterCondition = {
      id: Date.now().toString(),
      value: '',
      operator: defaultOperator
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter(c => c.id !== id));
    }
  };

  const updateCondition = (id: string, field: keyof FilterCondition, value: any) => {
    setConditions(conditions.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleApply = () => {
    const validConditions = conditions.filter(c => c.value.trim() !== '');
    onFilterChange(field, validConditions, logic);
    onClose();
  };

  const handleClear = () => {
    onFilterChange(field, [], logic);
    onClose();
  };

  const hasMultipleConditions = conditions.length > 1;

  const dropdownContent = (
    <div 
      ref={dropdownRef} 
      className="filter-dropdown-portal"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1002
      }}
    >
      <div className="filter-dropdown-header">
        <span className="filter-dropdown-title">Filter Options</span>
        <button className="filter-close-button" onClick={onClose}>×</button>
      </div>
      <div className="filter-dropdown-content">
        {hasMultipleConditions && (
          <div className="filter-logic-section">
            <label>Logic:</label>
            <select 
              value={logic} 
              onChange={(e) => setLogic(e.target.value as FilterLogic)}
              className="filter-logic-select"
            >
              <option value="AND">AND</option>
              <option value="OR">OR</option>
            </select>
          </div>
        )}
        
        <div className="filter-conditions">
          {conditions.map((condition, index) => (
            <div key={condition.id} className="filter-condition">
              {index > 0 && hasMultipleConditions && (
                <div className="filter-logic-indicator">
                  <span className="logic-text">{logic}</span>
                </div>
              )}
              
              <div className="filter-condition-controls">
                <select 
                  value={condition.operator} 
                  onChange={(e) => updateCondition(condition.id, 'operator', e.target.value as FilterOperator)}
                  className="filter-operator-select"
                >
                  {filterOperators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  value={condition.value}
                  onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                  placeholder="Enter filter value..."
                  className="filter-value-input"
                />
                
                <button 
                  className="remove-condition-button"
                  onClick={() => removeCondition(condition.id)}
                  title="Remove condition"
                  disabled={conditions.length === 1}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="filter-add-condition">
          <button 
            className="add-condition-button"
            onClick={addCondition}
          >
            + Add Condition
          </button>
        </div>
        
        <div className="filter-actions">
          <button className="filter-button apply" onClick={handleApply}>Apply</button>
          <button className="filter-button clear" onClick={handleClear}>Clear</button>
        </div>
      </div>
    </div>
  );

  return createPortal(dropdownContent, document.body);
};
