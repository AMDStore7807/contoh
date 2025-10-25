import { Routes, Route, Link, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login";
import Home from "./pages/Home";
import { useState } from "react";

function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const onLoginSuccess = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  console.log("token", token);
  return (
    <div>
      <nav>
        {/* Link ke "/" sekarang akan otomatis ke /login.
          Mungkin Bos mau ganti ini ke /home atau /login langsung.
        */}
        <Link to="/home">Home</Link> | <Link to="/about">About</Link> |{" "}
        <Link to="/login">Login</Link>
      </nav>

      <hr />

      <Routes>
        {/* Redirect root to home */}
        <Route path="/" element={<Navigate to="/home" />} />

        {/* Login route */}
        <Route
          path="/login"
          element={<LoginPage onLoginSuccess={onLoginSuccess} />}
        />

        {/* Home route - temporarily unprotected to test devices */}
        <Route path="/home" element={<Home />} />

        {/* Opsional: Rute "catch-all" untuk halaman tidak ditemukan */}
        <Route path="*" element={<h2>404: Halaman Tidak Ditemukan</h2>} />
      </Routes>
    </div>
  );
}

export default App;
