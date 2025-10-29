import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login";
import Home from "./pages/Home";
import DashboardPage from "./pages/Dashboard";
import DevicesPage from "./pages/Devices";
import SettingsPage from "./pages/Settings";
import { AuthProvider } from "./providers/auth-provider";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <div>
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Login route - public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/devices"
            element={
              <ProtectedRoute requiredResource="devices" requiredAccess={1}>
                <DevicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Opsional: Rute "catch-all" untuk halaman tidak ditemukan */}
          <Route path="*" element={<h2>404: Halaman Tidak Ditemukan</h2>} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
