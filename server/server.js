const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { nanoid } = require("nanoid");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Domain cho phép gọi API
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://imdtrung36.github.io",
  "https://imdtrung36.github.io/20_10",
];

// ✅ Cấu hình CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ Blocked CORS from:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// ✅ Thêm headers cho an toàn
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 🗂️ Data folder
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const messagesDataPath = path.join(dataDir, "messages.json");

// 🪄 Init file
if (!fs.existsSync(messagesDataPath)) {
  fs.writeFileSync(messagesDataPath, JSON.stringify([], null, 2));
}

// ⚙️ Helpers
const readJsonData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return [];
  }
};

const writeJsonData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const getClientIp = (req) => {
  const xff = req.headers["x-forwarded-for"];
  return xff ? xff.split(",")[0].trim() : req.socket.remoteAddress;
};

const hashIp = (ip) => crypto.createHash("sha256").update(ip).digest("hex");

//
// 🌸 ROUTES
//

// 💌 Lấy tất cả lời chúc
app.get("/api/messages", (req, res) => {
  try {
    const messages = readJsonData(messagesDataPath);
    res.json(messages);
  } catch {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// 💐 Lấy tất cả lời chúc của 1 người (theo visitorToken)
app.get("/api/messages/share-tree/:visitorToken", (req, res) => {
  try {
    const { visitorToken } = req.params;
    const messages = readJsonData(messagesDataPath);
    const userMessages = messages.filter((m) => m.visitorToken === visitorToken);

    if (!userMessages.length)
      return res.status(404).json({ success: false, message: "No messages found" });

    res.json({
      success: true,
      count: userMessages.length,
      data: userMessages,
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch shared tree" });
  }
});

// 🪻 Gửi lời chúc mới
app.post("/api/messages", (req, res) => {
  try {
    const { name, message, visitorToken } = req.body;
    if (!name || !message)
      return res.status(400).json({ error: "Name and message are required" });

    const ip = getClientIp(req);
    const ipHash = hashIp(ip);

    const visitor = visitorToken || nanoid(12);
    const messages = readJsonData(messagesDataPath);

    const newMessage = {
      id: Date.now(),
      name: name.trim(),
      message: message.trim(),
      visitorToken: visitor,
      ipHash,
      timestamp: new Date().toISOString(),
    };

    messages.push(newMessage);
    writeJsonData(messagesDataPath, messages);

    // ✅ Link chia sẻ đúng dạng view.html?visitorToken=xxx
    const frontendBaseUrl = "https://imdtrung36.github.io/20_10";
    const shareLink = `${frontendBaseUrl}/view.html?visitorToken=${visitor}`;

    res.status(201).json({
      success: true,
      data: {
        message: newMessage,
        treeLink: shareLink,
        visitorToken: visitor,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add message" });
  }
});

// 🔐 Xoá toàn bộ (chỉ admin)
app.delete("/api/messages", (req, res) => {
  const key = req.query.key;
  const ADMIN_KEY = process.env.ADMIN_KEY || "trungvip123";
  if (key !== ADMIN_KEY) return res.status(403).json({ error: "Forbidden" });

  writeJsonData(messagesDataPath, []);
  res.json({ success: true, message: "All messages deleted" });
});

// 🩵 Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
