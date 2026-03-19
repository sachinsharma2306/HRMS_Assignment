# HRMS Lite

A lightweight Human Resource Management System built as a full-stack assignment.

## Live Links
- Backend API: https://hrms-assignment-rokq.onrender.com/api

## Tech Stack
- **Frontend**: React Vite
- **Backend**: Django, Django REST Framework, django-cors-headers
- **Database**: SQLite
- **Deployment**: Vercel (Frontend), Render (Backend)


## API Endpoints


| GET  /api/employees/  List all employees 
| POST  /api/employees/  Add new employee 
| DELETE  /api/employees/:id/  Delete employee 
| GET  /api/attendance/  List attendance records 
| POST  /api/attendance/  Mark attendance 
| PATCH  /api/attendance/:id/  Update attendance status 
| GET  /api/dashboard/  Dashboard summary stats 

## Features
- Add, view, delete employees
- Mark and update daily attendance (Present / Absent)
- Filter attendance by date and employee
- Dashboard with live summary counts
- Total present days shown per employee

