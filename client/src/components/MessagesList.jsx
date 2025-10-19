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

  // Reset toàn bộ lời chúc (yêu cầu admin key trên server)
  const resetAllMessages = async () => {
    const ok = confirm("Bạn có chắc muốn xóa TẤT CẢ lời chúc?");
    if (!ok) return;
    const key = prompt("Nhập admin key để xác nhận:");
    if (key === null) return;
    try {
      const res = await axios.delete(`${API_ENDPOINTS.MESSAGES}?key=${encodeURIComponent(key)}`);
      if (res.data && res.data.success) {
        setMessages([]);
        alert("Đã reset toàn bộ lời chúc.");
      } else {
        alert("Không thể reset (sai key hoặc server từ chối).");
      }
    } catch (e) {
      alert("Không thể reset (lỗi kết nối hoặc server).");
    }
  };

  return (
    <>
      {/* 🌸 Cây + lá thư */}
      <div className="tree-container">
        <div className="tree">
          <img src={import.meta.env.BASE_URL + "tree.png"} alt="Tree" />

          {messages.map((msg, i) => {
            const positions = [
              { left: 20, top: 15, rotate: -5 },
              { left: 70, top: 20, rotate: 8 },
              { left: 15, top: 45, rotate: -12 },
              { left: 75, top: 40, rotate: 15 },
              { left: 25, top: 70, rotate: -8 },
              { left: 65, top: 75, rotate: 10 },
              { left: 45, top: 25, rotate: 3 },
              { left: 50, top: 60, rotate: -6 },
            ];
            const position = positions[i % positions.length];

            return (
              <div
                key={i}
                className="letter clickable-card"
                style={{
                  left: `${position.left}%`,
                  top: `${position.top}%`,
                  transform: `rotate(${position.rotate}deg)`,
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

      {/* Reset toàn bộ */}
      <button className="reset-btn" onClick={resetAllMessages}>⟲ Reset</button>

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


