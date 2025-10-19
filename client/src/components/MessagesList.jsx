import { useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS, FALLBACK_DATA } from "../config/api";
import "../styles/MessagesList.css";

export default function MessagesList() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Generate stable pseudo-random number from a seed (id/string)
  const seedToUnit = (seed) => {
    const str = String(seed ?? "");
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
      // Simple string hash, bounded to keep deterministic yet lightweight
      hash = (hash * 31 + str.charCodeAt(i)) % 1000003;
    }
    return (hash % 1000) / 1000; // 0..1
  };

  // Golden-angle spiral to spread notes across the tree area without a hard cap
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
  const computePosition = (index, seed) => {
    const n = index + 1; // avoid zero
    const c = 4; // step radius in percentage units
    const r = c * Math.sqrt(n);
    const theta = n * GOLDEN_ANGLE + seed * 2 * Math.PI;

    // Base around the visual crown of the tree
    let left = 50 + r * Math.cos(theta);
    let top = 46 + 0.85 * r * Math.sin(theta);

    // Keep within the crown bounds (avoid trunk and edges)
    left = Math.max(8, Math.min(84, left));
    top = Math.max(12, Math.min(76, top));

    // Slight, deterministic rotation per card
    const rotate = -12 + (seed * 24);
    return { left, top, rotate };
  };

  // Collision-avoidance layout
  const CARD_W = 16; // approximate width in % of container
  const CARD_H = 10; // approximate height in %
  const margin = 1.2; // spacing between cards in %

  const toRect = (pos) => ({
    l: pos.left,
    t: pos.top,
    r: pos.left + CARD_W,
    b: pos.top + CARD_H,
  });

  const intersects = (a, b) => !(a.r + 0 <= b.l - margin || a.l - 0 >= b.r + margin || a.b + 0 <= b.t - margin || a.t - 0 >= b.b + margin);

  const placeNonOverlapping = (index, seed, placed) => {
    // Try base position first, then expand radius/angle until no collision or max tries
    let radiusBoost = 0;
    let angleJitter = 0;
    for (let tries = 0; tries < 160; tries += 1) {
      const n = index + 1;
      const c = 4;
      const r = c * Math.sqrt(n) + radiusBoost;
      const theta = n * GOLDEN_ANGLE + seed * 2 * Math.PI + angleJitter;

      let left = 50 + r * Math.cos(theta);
      let top = 46 + 0.85 * r * Math.sin(theta);

      left = Math.max(6, Math.min(94 - CARD_W, left));
      top = Math.max(10, Math.min(90 - CARD_H, top));

      const pos = { left, top, rotate: -12 + seed * 24 };
      const rect = toRect(pos);
      let ok = true;
      for (let j = 0; j < placed.length; j += 1) {
        if (intersects(rect, toRect(placed[j]))) { ok = false; break; }
      }
      if (ok) return pos;

      // Increase radius gradually and wobble angle slightly
      radiusBoost += 1.6;
      angleJitter += 0.35 + seed * 0.2;
    }
    // Fallback: return base computed position even if it collides
    return computePosition(index, seed);
  };

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

  // Mở ngẫu nhiên một lời chúc trong danh sách
  const openRandomMessage = () => {
    if (!messages || messages.length === 0) return;
    const idx = Math.floor(Math.random() * messages.length);
    setSelectedMessage(messages[idx]);
  };

  return (
    <>
      {/* 🌸 Cây + lá thư */}
      <div className="tree-container">
        <div className="tree">
          <img className="tree-image" src={import.meta.env.BASE_URL + "tree.png"} alt="Tree" />

          {(() => {
            const placed = [];
            return messages.map((msg, i) => {
              const seed = seedToUnit(msg?.id ?? `${msg?.name}-${i}`);
              const position = placeNonOverlapping(i, seed, placed);
              placed.push(position);
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
            });
          })()}
        </div>
      </div>

      {/* Reset toàn bộ */}
      <button className="reset-btn" onClick={resetAllMessages}>⟲ Reset</button>

      {/* Nút xem 1 lời chúc (mở modal giống ảnh demo) */}
      <button className="view-random-btn" onClick={openRandomMessage}>👀 Xem lời chúc</button>

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


