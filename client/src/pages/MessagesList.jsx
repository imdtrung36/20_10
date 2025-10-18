import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/MessagesList.css";

export default function MessagesList() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:3001/api/messages").then((res) => {
      setMessages(res.data);
    });
  }, []);

  const openMessage = (message) => {
    setSelectedMessage(message);
  };

  const closeMessage = () => {
    setSelectedMessage(null);
  };

  return (
    <>
      <div className="tree-container">
        <div className="tree">
          <img src="/tree.png" alt="tree" className="tree-image" />
        {messages.map((msg, i) => {
          // Vị trí cố định dựa trên index
          const positions = [
            { left: 20, top: 15, rotate: -5 },
            { left: 70, top: 20, rotate: 8 },
            { left: 15, top: 45, rotate: -12 },
            { left: 75, top: 40, rotate: 15 },
            { left: 25, top: 70, rotate: -8 },
            { left: 65, top: 75, rotate: 10 },
            { left: 45, top: 25, rotate: 3 },
            { left: 50, top: 60, rotate: -6 }
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

      {/* Modal hiển thị tin nhắn đầy đủ */}
      {selectedMessage && (
        <div className="message-modal-overlay" onClick={closeMessage}>
          <div className="message-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💌 Lời chúc</h2>
              <button className="close-btn" onClick={closeMessage}>×</button>
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
