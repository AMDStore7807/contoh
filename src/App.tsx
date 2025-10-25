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

  const isAuthenticated = !!token;

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
        {/* 2. INI KUNCINYA:
          Saat user membuka path "/", ganti elemennya dengan <Navigate />
          yang mengarahkan (to) ke "/login".
        */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/home" : "/login"} />}
        />

        {/* 3. Tentukan path untuk halaman login itu sendiri */}
        <Route
          path="/login"
          element={<LoginPage onLoginSuccess={onLoginSuccess} />}
        />

        {/* Protected home route */}
        <Route
          path="/home"
          element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
        />

        {/* Opsional: Rute "catch-all" untuk halaman tidak ditemukan */}
        <Route path="*" element={<h2>404: Halaman Tidak Ditemukan</h2>} />
      </Routes>
    </div>
  );
}

export default App;
