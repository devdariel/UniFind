# UniFind
## Web-Based Lost & Found Management System for University

UniFind is a modern, role-based **Lost & Found Management System** designed for university campuses.  
It enables students to report lost items, browse found items, and submit ownership claims, while administrators manage item verification, claims review, and full audit history.

The system is developed following **software engineering best practices**, including layered architecture, RESTful APIs, role-based access control, and persistent relational data storage.

---

## Project Objectives
- Digitize the university lost & found process
- Reduce time and manual effort in item recovery
- Ensure secure role-based access for students and administrators
- Maintain transparency through audit logs and item history
- Provide a modern and user-friendly interface

---

## User Roles

### Student
- Secure authentication
- Report lost items
- Browse found items
- Submit claims with proof of ownership
- Track claim status

### Administrator
- View and manage all items
- Review and process claims
- Approve or reject ownership requests
- View detailed item history and audit logs
- Maintain system integrity

---

## System Architecture

### Frontend
- React (Vite)
- Tailwind CSS
- Role-based routing
- JWT authentication handling

### Backend
- Node.js
- Express.js
- RESTful API architecture
- JWT-based authentication & authorization

### Database
- MySQL
- Relational schema design
- Audit tables for item status history and claims

---

## Core Features
- JWT authentication
- Role-based authorization (Student / Admin)
- Lost and found item lifecycle management
- Claim submission and review workflow
- Full audit history of item status changes
- Advanced search and filtering
- Responsive modern UI

---

## Database Overview

Main tables:
- `users`
- `items`
- `claims`
- `item_status_history`

Each critical system action is logged to ensure traceability and accountability.

---

## How to Run the Project

### Prerequisites
- Node.js (v18 or higher)
- MySQL Server
- MySQL Workbench (recommended)

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

Backend runs at:
```
http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:
```
http://localhost:5173
```

---

## End-to-End Testing
The system has been fully tested, including:
- Student and admin authentication
- Lost item reporting
- Found item submission
- Claim creation
- Claim approval and rejection
- Item status updates and history logging
- Database verification using MySQL Workbench

---

## Documentation & Screenshots
Screenshots demonstrating:
- Login interface
- Student dashboard
- Admin dashboard
- Claims review
- Item history timeline
- Database records

are included in the **project presentation** and **technical report**.

---

## Academic Context
This project was developed as part of a **Software Engineering course** and follows the full software development lifecycle:
- Requirements analysis
- System design
- Implementation
- Testing
- Documentation

All deliverables align with the submitted **project proposal**, **presentation template**, and **technical report template**.

---

## Authors
- **Dariel Shabani**
- **Vexhi Skeja**

---

## Project Status
**Completed**  
All backend and frontend features are fully implemented and integrated.