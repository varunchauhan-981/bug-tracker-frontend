# BugTrackPro — Full-Stack Issue & Project Tracking Platform

BugTrackPro is a full-stack Jira-inspired bug tracking and agile project management application built with the **MERN stack** (MongoDB, Express.js, React, Node.js). It enables software teams to organize projects, manage role-based workspace access, track issues across an interactive Kanban board, and collaborate through real-time issue discussions.

---

## Live Links & Repositories

- **Frontend Live App (Vercel):** https://bug-tracker-frontend-two-lime.vercel.app
- **Frontend Repository:** https://github.com/varunchauhan-981/bug-tracker-frontend
- **Backend API (Render):** https://bug-tracker-backend-gzq9.onrender.com
- **Backend Repository:** https://github.com/varunchauhan-981/bug-tracker-backend

---

## Key Features

- **Authentication & Input Validation:**
  - Secure JWT-based registration and login with password hashing (`bcryptjs`).
  - Strict client-side and server-side validation for email format, alphabetic full names, and password confirmation.
- **Role-Based Access Control (RBAC):**
  - **Admin:** Full visibility across all workspace projects, team member invitations, project creation, and issue deletion.
  - **Project Manager:** Create projects, invite team members, assign users to projects, and manage tickets.
  - **Developer:** Access assigned projects, create issues, update ticket progress on the Kanban board, and participate in comments.
- **Interactive Kanban Board:**
  - Drag-and-drop issue workflow across **To Do**, **In Progress**, and **Done** columns (`@hello-pangea/dnd`) with direct backend state synchronization.
  - Search issues by title and filter by priority (`Critical`, `High`, `Medium`, `Low`).
- **Issue Management & Collaboration:**
  - Detailed issue modal for editing summaries, descriptions, priority levels, status, and assignees.
  - Threaded comments section on every issue for team communication.
- **Dedicated User Profile Dashboard (`/profile`):**
  - Displays user account overview, workspace project count, and a table of assigned issues.
  - Allows users to update their display name and change their password securely.

---

## Tech Stack

- **Frontend:** React, React Router DOM, Tailwind CSS, Axios, Lucide React, `@hello-pangea/dnd`, React Hot Toast
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JSON Web Token (JWT), `bcryptjs`, CORS
- **Deployment:** Vercel (Frontend), Render (Backend), MongoDB Atlas (Database)

---

## Project Structure

```text
bug-tracker-frontend/
├── src/
│   ├── api/            # Axios instance with JWT interceptor
│   ├── context/        # Global AuthContext for session state
│   ├── pages/          # Login, Register, Dashboard, ProjectBoard, UserProfile
│   └── App.jsx         # Protected routes and application layout

bug-tracker-backend/
├── config/             # MongoDB connection setup
├── controllers/        # Auth, Project, and Ticket business logic
├── middleware/         # JWT authentication middleware
├── models/             # User, Project, and Ticket Mongoose schemas
├── routes/             # Express REST API endpoints
└── server.js           # Entry point and middleware configuration