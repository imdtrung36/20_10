import { useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS, FALLBACK_DATA } from "../config/api";
import "../styles/MessagesList.css";

export default function MessagesList() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [visitorToken, setVisitorToken] = useState(null);
  const [shareLink, setShareLink] = useState("");
  const [copyNotice, setCopyNotice] = useState("");

  useEffect(() => {
    // Lấy visitorToken đã lưu khi gửi lời chúc
    const token = localStorage.getItem("visitorToken");
    setVisitorToken(token);

    if (token) {
      // 🩷 Nếu có token → hiển thị lời chúc cá nhân
      loadMessages(`share-tree/${token}`);
      setShareLink(`${window.location.origin}/20_10/messages?token=${token}`);
    } else {
      // 🌸 Nếu chưa có token → hiển thị toàn bộ lời chúc chung
      loadMessages("");
    }
  }, []);

  const loadMessages = async (path = "") => {
    try {
      const res = await axios.get(
        path ? `${API_ENDPOINTS.MESSAGES}/${path}` : API_ENDPOINTS.MESSAGES
      );
      const data = res.data.data || res.data;
      setMessages(data);
    } catch (error) {
      console.warn("⚠️ API lỗi, dùng fallback:", error);
      setMessages(FALLBACK_DATA.messages);
    }
  };

  const openMessage = (message) => setSelectedMessage(message);
  const closeMessage = () => setSelectedMessage(null);

  const deleteAllMessages = async () => {
    const key = prompt("🔑 Nhập key admin để xác nhận xoá toàn bộ:");
    if (!key) return;
    try {
      const res = await axios.delete(`${API_ENDPOINTS.MESSAGES}?key=${key}`);
      if (res.data.success) {
        alert("✅ Đã xoá toàn bộ lời chúc!");
        setMessages([]);
      } else {
        alert("❌ Sai key hoặc server từ chối!");
      }
    } catch (err) {
      console.error("Lỗi khi xoá:", err);
      alert("⚠️ Không thể xoá (server lỗi hoặc sai key).");
    }
  };

  const handleShare = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopyNotice("✅ Đã copy link chia sẻ!");
      setTimeout(() => setCopyNotice(""), 3000);
    } catch {
      alert("⚠️ Không thể copy link, hãy tự copy thủ công.");
    }
  };

  return (
    <>
      <div className="tree-container">
        <h2>
          {visitorToken
            ? "💖 Cây lời chúc của bạn"
            : "🌸 Tất cả lời chúc"}
        </h2>

        <div className="tree">
          <img src={import.meta.env.BASE_URL + "tree.png"} alt="Tree" />

          {messages.map((msg, i) => {
            const randomLeft = 20 + Math.random() * 60;
            const randomTop = 15 + Math.random() * 60;
            const randomRotate = Math.random() * 20 - 10;

            return (
              <div
                key={i}
                className="letter clickable-card"
                style={{
                  left: `${randomLeft}%`,
                  top: `${randomTop}%`,
                  transform: `rotate(${randomRotate}deg)`,
                }}
                onClick={() => openMessage(msg)}
              >
                <div className="paper">
                  <div className="card-preview">
                    <p className="message-preview">💌</p>
                    <span className="sender-preview">— {msg.name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🗑️ Xoá tất cả (admin) */}
      <button className="delete-all-btn" onClick={deleteAllMessages}>
        🗑️ Xóa tất cả lời chúc
      </button>

      {/* 💌 Modal hiển thị chi tiết lời chúc */}
      {selectedMessage && (
        <div className="message-modal-overlay" onClick={closeMessage}>
          <div className="message-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💌 Lời chúc</h2>
              <button className="close-btn" onClick={closeMessage}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <p>"{selectedMessage.message}"</p>
              <span>— {selectedMessage.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* 🔗 Nút share nổi góc phải */}
      {visitorToken && (
        <>
          <button className="share-floating-btn" onClick={handleShare}>
            🔗 Share
          </button>
          {copyNotice && <div className="copy-toast">{copyNotice}</div>}
        </>
      )}
    </>
  );
}
