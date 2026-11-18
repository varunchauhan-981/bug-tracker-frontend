import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages & Components import
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectBoard from './pages/ProjectBoard';

// Protected Route: Agar user logged in nahi hai, toh wapas Login par bhej do
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center text-indigo-400">
        Loading...
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    // AuthProvider pure app ko user ka data (token, name) supply karta hai
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 font-sans text-slate-200 flex flex-col">
          <Navbar />
          
          <div className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes (Bina login ke nahi khulenge) */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/project/:projectId" 
                element={
                  <ProtectedRoute>
                    <ProjectBoard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>

          {/* Sunder popup messages dikhane ke liye Toaster */}
          <Toaster 
            position="bottom-right" 
            toastOptions={{ 
              style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } 
            }} 
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;