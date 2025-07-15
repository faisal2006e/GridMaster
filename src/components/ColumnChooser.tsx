
import React, { useState } from 'react';
import { Column } from '../types/grid';

interface ColumnChooserProps {
  columns: Column[];
  onColumnVisibilityChange: (field: string, visible: boolean) => void;
  onClose: () => void;
}

export const ColumnChooser: React.FC<ColumnChooserProps> = ({
  columns,
  onColumnVisibilityChange,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredColumns = columns.filter(column =>
    column.headerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="column-chooser-overlay">
      <div className="column-chooser-modal">
        <div className="column-chooser-header">
          <h3>Choose Columns</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="column-chooser-search">
          <input
            type="text"
            placeholder="Search columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="column-search-input"
          />
        </div>

        <div className="column-chooser-list">
          {filteredColumns.map(column => (
            <div key={column.field} className="column-chooser-item">
              <label className="column-chooser-label">
                <input
                  type="checkbox"
                  checked={column.visible !== false}
                  onChange={(e) => onColumnVisibilityChange(column.field, e.target.checked)}
                />
                <span>{column.headerName}</span>
              </label>
            </div>
          ))}
        </div>

        <div className="column-chooser-actions">
          <button 
            className="column-chooser-button"
            onClick={() => {
              columns.forEach(col => onColumnVisibilityChange(col.field, true));
            }}
          >
            Show All
          </button>
          <button 
            className="column-chooser-button"
            onClick={() => {
              columns.forEach(col => onColumnVisibilityChange(col.field, false));
            }}
          >
            Hide All
          </button>
        </div>
      </div>
    </div>
  );
};
