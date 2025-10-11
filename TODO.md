# TODO: Connect Frontend to Backend

## Steps to Complete
- [x] Install axios in frontend for API requests
- [x] Update backend/controllers/authController.js to set JWT cookie on register (call generateToken after user creation)
- [x] Update frontend/src/components/Auth/Register.jsx: Add form fields (name, username, email, password), handleSubmit with POST to http://localhost:5000/register, success redirect to /login, error handling
- [x] Update frontend/src/components/Auth/Login.jsx: Fix handleSubmit with POST to http://localhost:5000/login, success redirect to /dashboard, error handling, remove unused loginpage export
- [x] Update frontend/src/App.jsx: Add routes for /admin and /employee using AdminDashboard and EmployeeDashboard components, add basic redirect logic after auth
- [ ] Test: Start backend (cd backend && npm start), start frontend (cd frontend && npm run dev), test register/login forms, verify API calls and redirects
