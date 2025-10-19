import { useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS, FALLBACK_DATA } from "../config/api";
import "../styles/MessagesList.css";

export default function MessagesList() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    const fetchMessages = () => {
      axios
        .get(API_ENDPOINTS.MESSAGES)
        .then((res) => {
          setMessages(res.data);
        })
        .catch((error) => {
          console.warn("API not available, using fallback data:", error);
          setMessages(FALLBACK_DATA.messages);
        });
    };

    fetchMessages();

    // Lắng nghe khi form gửi xong để tự reload danh sách
    const onStorage = (e) => {
      if (e.key === 'lastMessageAddedAt') {
        fetchMessages();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const openMessage = (message) => {
    setSelectedMessage(message);
  };

  const closeMessage = () => {
    setSelectedMessage(null);
  };

  // (Đã bỏ nút xoá toàn bộ)

  return (
    <>
      {/* 🌸 Cây + lá thư */}
      <div className="tree-container">
        <div className="tree">
          <img src={import.meta.env.BASE_URL + "tree.png"} alt="Tree" />

          {messages.map((msg, i) => {
            // Phân bố vị trí ngẫu nhiên có hạt giống theo index để không bị trùng và hỗ trợ không giới hạn số thư
            const seeded = (n) => {
              const x = Math.sin(n * 9999.97 + 0.12345) * 10000;
              return x - Math.floor(x);
            };
            const left = 15 + seeded(i * 2 + 1) * 70; // 15% → 85%
            const top = 12 + seeded(i * 2 + 7) * 70;  // 12% → 82%
            const rotate = (seeded(i * 3 + 4) - 0.5) * 24; // -12° → 12°

            return (
              <div
                key={i}
                className="letter clickable-card"
                style={{
                  left: `${left.toFixed(2)}%`,
                  top: `${top.toFixed(2)}%`,
                  transform: `rotate(${rotate.toFixed(2)}deg)`,
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

      {/* Nút xoá toàn bộ đã được loại bỏ theo yêu cầu */}

      {/* 📨 Modal hiển thị lời chúc */}
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
              <div className="message-display">
                <p>"{selectedMessage.message}"</p>
                <span className="sender">— {selectedMessage.name}</span>
              </div>
            </div>
            <div className="modal-footer">
              <p>Chúc bạn một ngày tốt lành! 🌸</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


