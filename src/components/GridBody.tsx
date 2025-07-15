import React, { useState } from 'react';
import { Column } from '../types/grid';

interface GridBodyProps {
  data: any[];
  columns: Column[];
  editable?: boolean;
  onRowUpdate?: (updatedRow: any) => void;
  showColumnChooser?: boolean;
}

export const GridBody: React.FC<GridBodyProps> = ({
  data,
  columns,
  editable = false,
  onRowUpdate,
  showColumnChooser = false
}) => {
  const [editingCell, setEditingCell] = useState<{ rowId: any; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

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

  const toggleGroupExpansion = (groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const renderCell = (row: any, column: Column) => {
    // Handle group header rows
    if (row.__isGroupHeader) {
      return null; // Group headers are handled separately
    }

    const value = row[column.field];
    const isEditing = editingCell?.rowId === row.id && editingCell?.field === column.field;

    if (isEditing) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleCellSave(row)}
          onKeyDown={(e) => handleKeyDown(e, row)}
          autoFocus
          className="cell-editor"
        />
      );
    }

    const displayValue = column.cellRenderer ? column.cellRenderer(value) : value;

    return (
      <span
        className={`cell-content ${editable && column.editable !== false ? 'editable' : ''}`}
        onDoubleClick={() => handleCellDoubleClick(row.id, column.field, value)}
      >
        {displayValue}
      </span>
    );
  };

  const visibleColumns = columns.filter(column => column.visible !== false);

  if (data.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={visibleColumns.length} style={{ padding: 0 }}>
            <div className="grid-empty-state">
              <div className="grid-empty-state-icon">📊</div>
              <div className="grid-empty-state-title">No Data Found</div>
              <div className="grid-empty-state-message">
                No records match your current filter criteria. Try adjusting your filters or clearing them to see more results.
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {data.map((row, index) => {
        // Handle group header rows
        if (row.__isGroupHeader) {
          const isExpanded = expandedGroups.has(row.__groupKey);
          
          return (
            <tr key={`group-${row.__groupKey}`} className="grid-group-header-row">
              <td 
                colSpan={visibleColumns.length} 
                className="grid-group-header-cell"
              >
                <div className="group-header-content">
                  <span 
                    className="group-header-icon"
                    onClick={() => toggleGroupExpansion(row.__groupKey)}
                  >
                    {isExpanded ? '▼' : '▶'}
                  </span>
                  <span className="group-header-text">
                    {row.__groupKey} ({row.__groupCount})
                  </span>
                </div>
              </td>
            </tr>
          );
        }

        // Find the group key for this row
        const groupKey = data.find((d, i) => 
          i < index && d.__isGroupHeader && 
          data.slice(i + 1, index).every(item => !item.__isGroupHeader)
        )?.__groupKey;

        // Hide row if its group is collapsed
        if (groupKey && !expandedGroups.has(groupKey)) {
          return null;
        }

        return (
          <tr key={row.id || index} className="grid-row">
            {visibleColumns.map(column => (
              <td key={column.field} className="grid-cell">
                {renderCell(row, column)}
              </td>
            ))}
          </tr>
        );
      })}
    </tbody>
  );
};