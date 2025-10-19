const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

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

// 🔑 Tạo token ngẫu nhiên base64url (không cần thư viện ngoài)
const randomToken = (length) => {
  const bytes = crypto.randomBytes(Math.ceil(length * 0.75));
  return bytes
    .toString("base64")
    .replace(/[+/=]/g, "")
    .slice(0, length);
};

// 🔑 Sinh token không trùng
const generateUniqueToken = (length, existingSet) => {
  let token = randomToken(length);
  while (existingSet && existingSet.has(token)) {
    token = randomToken(length);
  }
  return token;
};

//
// 🌸 ROUTES
//

// 💌 Lấy tất cả lời chúc
app.get("/api/messages", (req, res) => {
  try {
    const messages = readJsonData(messagesDataPath);
    console.log("[GET /api/messages] total=", messages.length);
    res.json(messages);
  } catch {
    console.error("[GET /api/messages] error");
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// 💐 Lấy tất cả lời chúc của 1 người (theo visitorToken)
app.get("/api/messages/share-tree/:visitorToken", (req, res) => {
  try {
    const { visitorToken } = req.params;
    const messages = readJsonData(messagesDataPath);
    const userMessages = messages.filter((m) => m.visitorToken === visitorToken);

    // Luôn trả 200, kể cả khi không có dữ liệu (tránh 404 phía client)
    console.log("[GET /api/messages/share-tree/:visitorToken] token=", visitorToken, "count=", userMessages.length);
    res.json({
      success: true,
      count: userMessages.length,
      data: userMessages,
    });
  } catch {
    console.error("[GET /api/messages/share-tree/:visitorToken] error token=", req.params?.visitorToken);
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

    const messages = readJsonData(messagesDataPath);

    // 🔑 Tạo visitorToken không trùng (nếu client chưa có)
    const existingVisitors = new Set(messages.map((m) => m.visitorToken).filter(Boolean));
    const visitor = visitorToken && visitorToken.length > 0
      ? visitorToken
      : generateUniqueToken(12, existingVisitors);

    // 🔗 Sinh shareToken cho từng lời chúc (dùng để tạo link chia sẻ riêng) và đảm bảo không trùng
    const existingShareTokens = new Set(messages.map((m) => m.shareToken).filter(Boolean));
    const shareToken = generateUniqueToken(11, existingShareTokens);

    const newMessage = {
      id: Date.now(),
      name: name.trim(),
      message: message.trim(),
      visitorToken: visitor,
      ipHash,
      shareToken,
      timestamp: new Date().toISOString(),
    };

    messages.push(newMessage);
    writeJsonData(messagesDataPath, messages);

    // ✅ Link chia sẻ cho từng lời chúc: https://<server>/share/<token>
    const proto = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.get("host");
    const shareLink = `${proto}://${host}/share/${shareToken}`;

    console.log("[POST /api/messages] name=", name, "visitorToken=", visitor, "ip=", ip, "shareToken=", shareToken);

    res.status(201).json({
      success: true,
      data: {
        message: newMessage,
        shareLink,
        visitorToken: visitor,
      },
    });
  } catch (error) {
    console.error("[POST /api/messages] error:", error);
    res.status(500).json({ error: "Failed to add message" });
  }
});

// 🔗 Lấy một lời chúc theo shareToken (JSON)
app.get("/api/messages/share/:token", (req, res) => {
  try {
    const { token } = req.params;
    const messages = readJsonData(messagesDataPath);
    const item = messages.find((m) => m.shareToken === token);
    console.log("[GET /api/messages/share/:token] token=", token, "found=", !!item);
    if (!item) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: item });
  } catch (e) {
    console.error("[GET /api/messages/share/:token] error token=", req.params?.token, e);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🖼️ Trang share công khai (SSR đơn giản)
app.get("/share/:token", (req, res) => {
  try {
    const { token } = req.params;
    const messages = readJsonData(messagesDataPath);
    const item = messages.find((m) => m.shareToken === token);
    if (!item) return res.status(404).send("<h1>❌ Không tìm thấy lời chúc</h1>");

    const safe = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const html = `<!doctype html>
    <html lang="vi">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Thiệp của ${safe(item.name)}</title>
        <style>
          body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:linear-gradient(180deg,#ffe6ef,#ffd6eb);margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh}
          .card{background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.12);padding:28px;max-width:560px;width:92%}
          h1{margin:0 0 10px;color:#d63384}
          .msg{font-size:20px;line-height:1.6;margin:10px 0 16px}
          .sender{color:#888}
          .cta{margin-top:20px}
          .btn{display:inline-block;background:#ff6fa9;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px}
        </style>
      </head>
      <body>
        <div class="card">
          <h1>💌 Lời chúc của ${safe(item.name)}</h1>
          <div class="msg">“${safe(item.message)}”</div>
          <div class="sender">— ${safe(item.name)}</div>
          <div class="cta"><a class="btn" href="/20_10/">💌 Tạo thiệp của bạn</a></div>
        </div>
      </body>
    </html>`;
    res.send(html);
  } catch (e) {
    res.status(500).send("Server error");
  }
});

// ➕ Tạo (hoặc lấy) shareToken cho một lời chúc theo id
app.post("/api/messages/:id/share", (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid id" });
    const messages = readJsonData(messagesDataPath);
    const idx = messages.findIndex((m) => m.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: "Not found" });

    // Nếu chưa có shareToken thì tạo mới, đảm bảo không trùng
    if (!messages[idx].shareToken) {
      const existing = new Set(messages.map((m) => m.shareToken).filter(Boolean));
      messages[idx].shareToken = generateUniqueToken(11, existing);
      writeJsonData(messagesDataPath, messages);
      console.log("[POST /api/messages/:id/share] created token for id=", id, "token=", messages[idx].shareToken);
    } else {
      console.log("[POST /api/messages/:id/share] reuse token for id=", id, "token=", messages[idx].shareToken);
    }

    const proto = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.get("host");
    const shareLink = `${proto}://${host}/share/${messages[idx].shareToken}`;
    res.json({ success: true, data: { shareLink, message: messages[idx] } });
  } catch (e) {
    console.error("[POST /api/messages/:id/share] error id=", req.params?.id, e);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔐 Xoá toàn bộ (chỉ admin)
app.delete("/api/messages", (req, res) => {
  const key = req.query.key;
  const ADMIN_KEY = process.env.ADMIN_KEY || "trungvip123";
  console.log("[DELETE /api/messages] key provided=", key ? "yes" : "no");
  if (key !== ADMIN_KEY) return res.status(403).json({ error: "Forbidden" });

  writeJsonData(messagesDataPath, []);
  console.log("[DELETE /api/messages] all messages deleted");
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
