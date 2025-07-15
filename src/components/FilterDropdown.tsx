
import React, { useState, useRef, useEffect } from 'react';
import { FilterOperator, FilterConfig, FilterCondition, FilterLogic } from '../types/grid';

interface FilterDropdownProps {
  field: string;
  filterConfig: FilterConfig;
  onFilterChange: (field: string, conditions: FilterCondition[], logic: FilterLogic) => void;
  onClose: () => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  field,
  filterConfig,
  onFilterChange,
  onClose
}) => {
  const currentFilter = filterConfig[field];
  const [conditions, setConditions] = useState<FilterCondition[]>(
    currentFilter?.conditions || [{ id: Date.now().toString(), value: '', operator: 'contains' }]
  );
  const [logic, setLogic] = useState<FilterLogic>(currentFilter?.logic || 'AND');
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

  const addCondition = () => {
    const newCondition: FilterCondition = {
      id: Date.now().toString(),
      value: '',
      operator: 'contains'
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

  return (
    <div ref={dropdownRef} className="filter-dropdown">
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
                
                {conditions.length > 1 && (
                  <button 
                    className="remove-condition-button"
                    onClick={() => removeCondition(condition.id)}
                    title="Remove condition"
                  >
                    ×
                  </button>
                )}
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
};
