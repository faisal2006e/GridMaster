
import React, { useState } from 'react';
import { Column } from '../types/grid';

interface GridBodyProps {
  data: any[];
  columns: Column[];
  editable?: boolean;
  onRowUpdate?: (updatedRow: any) => void;
}

export const GridBody: React.FC<GridBodyProps> = ({
  data,
  columns,
  editable = false,
  onRowUpdate
}) => {
  const [editingCell, setEditingCell] = useState<{ rowId: any; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleCellDoubleClick = (rowId: any, field: string, currentValue: any) => {
    if (!editable) return;
    
    setEditingCell({ rowId, field });
    setEditValue(currentValue?.toString() || '');
  };

  const handleCellSave = (row: any) => {
    if (!editingCell || !onRowUpdate) return;
    
    const updatedRow = {
      ...row,
      [editingCell.field]: editValue
    };
    
    onRowUpdate(updatedRow);
    setEditingCell(null);
    setEditValue('');
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: any) => {
    if (e.key === 'Enter') {
      handleCellSave(row);
    } else if (e.key === 'Escape') {
      handleCellCancel();
    }
  };

  const renderCell = (row: any, column: Column) => {
    const isEditing = editingCell?.rowId === row.id && editingCell?.field === column.field;
    const cellValue = row[column.field];
    
    if (isEditing) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleCellSave(row)}
          onKeyDown={(e) => handleKeyDown(e, row)}
          className="cell-editor"
          autoFocus
        />
      );
    }
    
    const displayValue = column.cellRenderer 
      ? column.cellRenderer(cellValue)
      : cellValue?.toString() || '';
    
    return (
      <span
        className={`cell-content ${editable ? 'editable' : ''}`}
        onDoubleClick={() => handleCellDoubleClick(row.id, column.field, cellValue)}
      >
        {displayValue}
      </span>
    );
  };

  return (
    <tbody>
      {data.map((row, index) => (
        <tr key={row.id || index} className="grid-row">
          {columns.map(column => (
            <td key={column.field} className="grid-cell">
              {renderCell(row, column)}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};
