
import React, { useState } from 'react';
import './App.css';
import { Grid } from './components/Grid';
import { Column } from './types/grid';

// Sample data
const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, department: 'Engineering', salary: 75000 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 28, department: 'Marketing', salary: 65000 },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, department: 'Sales', salary: 70000 },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', age: 32, department: 'Engineering', salary: 80000 },
  { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', age: 29, department: 'HR', salary: 60000 },
  { id: 6, name: 'Diana Wilson', email: 'diana@example.com', age: 31, department: 'Finance', salary: 72000 },
  { id: 7, name: 'Edward Miller', email: 'edward@example.com', age: 33, department: 'Engineering', salary: 78000 },
  { id: 8, name: 'Fiona Garcia', email: 'fiona@example.com', age: 27, department: 'Marketing', salary: 63000 },
  { id: 9, name: 'George Martinez', email: 'george@example.com', age: 34, department: 'Sales', salary: 69000 },
  { id: 10, name: 'Helen Rodriguez', email: 'helen@example.com', age: 26, department: 'HR', salary: 58000 },
];

const columns: Column[] = [
  { field: 'id', headerName: 'ID', width: 80, sortable: true },
  { field: 'name', headerName: 'Name', width: 150, sortable: true, filterable: true },
  { field: 'email', headerName: 'Email', width: 200, sortable: true, filterable: true },
  { field: 'age', headerName: 'Age', width: 100, sortable: true, filterable: true },
  { field: 'department', headerName: 'Department', width: 150, sortable: true, filterable: true },
  { 
    field: 'salary', 
    headerName: 'Salary', 
    width: 120, 
    sortable: true, 
    filterable: true,
    cellRenderer: (value: number) => `$${value.toLocaleString()}`
  },
];

export default function App() {
  const [data, setData] = useState(sampleData);

  const handleRowUpdate = (updatedRow: any) => {
    setData(prevData => 
      prevData.map(row => row.id === updatedRow.id ? updatedRow : row)
    );
  };

  return (
    <div className="app">
      <h1>Grid Library Demo</h1>
      <Grid 
        data={data}
        columns={columns}
        onRowUpdate={handleRowUpdate}
        pagination={true}
        pageSize={5}
        editable={true}
        columnChooser={true}
      />
    </div>
  );
}
