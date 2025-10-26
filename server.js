// server.js
import express from "express";
import path from "path";
import { createProxyMiddleware } from "http-proxy-middleware";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";
import crypto from "crypto";

// Helper functions for password hashing
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha256").toString("hex");
}

function generateSalt() {
  return crypto.randomBytes(32).toString("hex");
}

// --- Setup Awal ---
const app = express();
const port = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017";
const dbName = "genieacs";
let db;

async function connectDB() {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    db = client.db(dbName);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

connectDB();

app.use(express.json());

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || "BEATCOM_BOSS";

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt:", username);

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    // Check user in MongoDB
    if (!db) return res.status(503).json({ message: "Database belum siap" });

    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ _id: username });

    if (!user) {
      console.log("Login failed: User not found:", username);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Verify password with crypto (SHA-256 with salt)
    const salt = user.salt;
    const hash = hashPassword(password, salt);
    const isPasswordValid = hash === user.password;
    if (!isPasswordValid) {
      console.log("Login failed: Wrong password for:", username);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("Login successful:", username);
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Logout endpoint (client-side token removal, but we can log it)
app.post("/api/logout", authenticateToken, (req, res) => {
  console.log("Logout successful:", req.user.username);
  res.json({ message: "Logged out successfully" });
});

// POST /api/users - Add new user (protected)
app.post("/api/users", async (req, res) => {
  const { username, password, roles } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    if (!db) return res.status(503).json({ message: "Database belum siap" });

    const usersCollection = db.collection("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Hash the password with crypto (SHA-256 with salt)
    const salt = generateSalt();
    const hashedPassword = hashPassword(password, salt);

    // Create new user
    const newUser = {
      _id: username,
      password: hashedPassword,
      salt,
      roles: roles || "user", // Default role
    };

    await usersCollection.insertOne(newUser);

    console.log("User created successfully:", username);
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/users - List all users (protected)
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ message: "Database belum siap" });

    const usersCollection = db.collection("users");
    const users = await usersCollection
      .find({}, { projection: { password: 0 } })
      .toArray(); // Exclude password

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT /api/users/:username - Update user (protected)
app.put("/api/users/:username", authenticateToken, async (req, res) => {
  const { username } = req.params;
  const { password, ...otherFields } = req.body;

  try {
    if (!db) return res.status(503).json({ message: "Database belum siap" });

    const usersCollection = db.collection("users");
    const updateData = { ...otherFields };

    if (password) {
      // Hash the new password with crypto (SHA-256 with salt)
      const salt = generateSalt();
      updateData.password = hashPassword(password, salt);
      updateData.salt = salt;
    }

    const result = await usersCollection.updateOne(
      { username },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE /api/users/:username - Delete user (protected)
app.delete("/api/users/:username", authenticateToken, async (req, res) => {
  const { username } = req.params;

  try {
    if (!db) return res.status(503).json({ message: "Database belum siap" });

    const usersCollection = db.collection("users");
    const result = await usersCollection.deleteOne({ username });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/welcome - Unprotected endpoint that logs request and returns welcome message
app.get("/api/welcome", (req, res) => {
  console.log(`Request: ${req.method} ${req.path}`);
  res.json({ message: "Welcome to the API" });
});

// --- 3. Atur Proxy API ke NBI (7557) ---
// Proxy semua request yang tidak ditangani oleh routes di atas ke NBI
// Hapus prefix /api saat proxy ke NBI
app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:7557", // Target backend NBI
    changeOrigin: true,
    pathRewrite: {
      "^/api": "", // Hapus /api prefix
    },
    onError: (err, req, res) => {
      console.error("Proxy error:", err);
      res.writeHead(503).end("NBI service (7557) sepertinya mati.");
    },
  })
);

// --- 4. Sajikan File Statis React (dari folder 'dist') ---
// app.use(express.static(distPath));

// // --- 5. Fallback untuk React Router ---
// // Semua request lain akan diarahkan ke index.html
// app.use((req, res) => {
//   // Skip API routes
//   if (req.path.startsWith("/api")) {
//     return res.status(404).json({ message: "API endpoint not found" });
//   }
//   res.sendFile(path.join(distPath, "index.html"));
// });

// --- 6. Jalankan Server ---
app.listen(port, () => {
  console.log(`Server PRODUKSI jalan di http://localhost:${port}`);
  console.log(`- Endpoint /login ditangani Express`);
  console.log(`- Request /api/* di-proxy ke 7557`);
  console.log(`- React App disajikan dari ./dist`);
});
