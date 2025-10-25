// server.js
// Ini adalah server produksi Bos, menggantikan 'vite dev'

import express from "express";
import path from "path";
import { createProxyMiddleware } from "http-proxy-middleware";
import { fileURLToPath } from "url";

// --- Setup Awal ---
const app = express();
const port = process.env.PORT || 3000; // Jalankan di port 3000

// Dapatkan __dirname (wajib untuk ES Module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "dist"); // Path ke folder build Vite

// --- 1. Atur Proxy API (PENTING) ---
// Ini adalah pengganti 'proxy' di vite.config.ts
// Semua request ke /api akan diteruskan ke NBI
app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:7557", // Target backend NBI
    changeOrigin: true,
    pathRewrite: {
      "^/api": "", // Hapus /api dari path ( /api/devices -> /devices )
    },
    // Tambahkan penanganan error jika NBI mati
    onError: (err, req, res) => {
      console.error("Proxy error:", err);
      res.writeHead(503, {
        "Content-Type": "application/json",
      });
      res.end(
        JSON.stringify({ message: "Proxy Error: NBI service (7557) down?" })
      );
    },
  })
);

// --- 2. Sajikan File Statis (Wajib) ---
// Sajikan file HTML, CSS, JS dari folder 'dist' hasil build Vite
app.use(express.static(distPath));

// --- 3. Atur Fallback untuk React Router (Wajib) ---
// Semua request GET yang BUKAN /api atau BUKAN file statis
// akan diarahkan ke index.html agar React Router bisa mengambil alih.
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// --- 4. Jalankan Server ---
app.listen(port, () => {
  console.log(`=================================================`);
  console.log(` UI PRODUKSI Bos (Express + React)`);
  console.log(` Jalan di: http://localhost:${port}`);
  console.log(`=================================================`);
});
