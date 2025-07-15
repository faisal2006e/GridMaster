
import React, { useState } from 'react';
import './App.css';
import { Grid } from './components/Grid';
import { Column } from './types/grid';

// Sample data
const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, department: 'Engineering', salary: 75000, hireDate: '2023-01-15', workTime: '09:00', lastLogin: '2024-01-15T14:30:00' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 28, department: 'Marketing', salary: 65000, hireDate: '2023-03-20', workTime: '08:30', lastLogin: '2024-01-16T10:15:00' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, department: 'Sales', salary: 70000, hireDate: '2022-11-10', workTime: '09:30', lastLogin: '2024-01-14T16:45:00' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', age: 32, department: 'Engineering', salary: 80000, hireDate: '2023-06-01', workTime: '08:00', lastLogin: '2024-01-17T09:20:00' },
  { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', age: 29, department: 'HR', salary: 60000, hireDate: '2023-04-12', workTime: '09:00', lastLogin: '2024-01-15T11:30:00' },
  { id: 6, name: 'Diana Wilson', email: 'diana@example.com', age: 31, department: 'Finance', salary: 72000, hireDate: '2023-02-28', workTime: '08:45', lastLogin: '2024-01-16T13:15:00' },
  { id: 7, name: 'Edward Miller', email: 'edward@example.com', age: 33, department: 'Engineering', salary: 78000, hireDate: '2022-12-05', workTime: '09:15', lastLogin: '2024-01-17T15:00:00' },
  { id: 8, name: 'Fiona Garcia', email: 'fiona@example.com', age: 27, department: 'Marketing', salary: 63000, hireDate: '2023-05-18', workTime: '08:30', lastLogin: '2024-01-14T12:45:00' },
  { id: 9, name: 'George Martinez', email: 'george@example.com', age: 34, department: 'Sales', salary: 69000, hireDate: '2023-01-30', workTime: '09:30', lastLogin: '2024-01-16T17:30:00' },
  { id: 10, name: 'Helen Rodriguez', email: 'helen@example.com', age: 26, department: 'HR', salary: 58000, hireDate: '2023-07-14', workTime: '08:15', lastLogin: '2024-01-15T08:45:00' },
];

const columns: Column[] = [
  { field: 'id', headerName: 'ID', width: 80, sortable: true, dataType: 'number' },
  { field: 'name', headerName: 'Name', width: 150, sortable: true, filterable: true, dataType: 'string' },
  { field: 'email', headerName: 'Email', width: 200, sortable: true, filterable: true, dataType: 'string' },
  { field: 'age', headerName: 'Age', width: 100, sortable: true, filterable: true, dataType: 'number' },
  { field: 'department', headerName: 'Department', width: 150, sortable: true, filterable: true, dataType: 'string' },
  { 
    field: 'salary', 
    headerName: 'Salary', 
    width: 120, 
    sortable: true, 
    filterable: true,
    dataType: 'number',
    cellRenderer: (value: number) => `$${value.toLocaleString()}`
  },
  { 
    field: 'hireDate', 
    headerName: 'Hire Date', 
    width: 120, 
    sortable: true, 
    filterable: true,
    dataType: 'date',
    cellRenderer: (value: string) => new Date(value).toLocaleDateString()
  },
  { 
    field: 'workTime', 
    headerName: 'Work Time', 
    width: 120, 
    sortable: true, 
    filterable: true,
    dataType: 'time',
    cellRenderer: (value: string) => value
  },
  { 
    field: 'lastLogin', 
    headerName: 'Last Login', 
    width: 180, 
    sortable: true, 
    filterable: true,
    dataType: 'datetime',
    cellRenderer: (value: string) => new Date(value).toLocaleString()
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
