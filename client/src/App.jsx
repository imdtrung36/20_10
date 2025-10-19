import { useState, useRef, useState as ReactUseState } from "react";
import axios from "axios";
import { API_ENDPOINTS, API_BASE_URL } from "./config/api";
import MessageForm from "./pages/MessageForm";
import MessagesList from "./components/MessagesList";
import "./styles/index.css";

function App() {
  const [page, setPage] = useState("form");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [toast, setToast] = useState(null);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => console.warn("Không thể phát:", err));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="app">
      {/* 🎵 Chỉ phát khi bấm nút */}
      <audio
        ref={audioRef}
        id="bg-music"
        src={import.meta.env.BASE_URL + "music.mp3"}
      />

      <header className="header">
        <h1 className="title">💐 Ngày Phụ nữ Việt Nam</h1>
        <div className="menu">
          <button onClick={() => setPage("form")}>Gửi lời chúc</button>
          <button onClick={() => setPage("messages")}>Xem lời chúc</button>
        </div>
      </header>

      <main className="content">
        {page === "form" && (
          <MessageForm onSubmitted={() => setPage("messages")} />
        )}
        {page === "messages" && <MessagesList />}
      </main>

      {/* 🔗 Share nổi: lấy link mới nhất nếu có */}
      <ShareButton notify={(msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2500);
      }} />

      <button className="music-btn" onClick={toggleMusic}>
        {isPlaying ? "🔊 Tắt nhạc" : "🎵 Bật nhạc"}
      </button>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

export default App;

// 🔗 Nút share dùng localStorage để lấy link gần nhất
function ShareButton({ notify }) {
  const handleClick = async () => {
    let link = null;
    try { link = localStorage.getItem('lastShareLink'); } catch {}
    if (!link) {
      // Nếu chưa có link share cụ thể, fallback sang link "cây" theo visitorToken (nếu server trả về)
      let vt = null;
      try { vt = localStorage.getItem('visitorToken'); } catch {}
      if (vt) {
        try {
          const res = await axios.get(`${API_ENDPOINTS.MESSAGES}/share-tree/${vt}`);
          const list = (res.data && (res.data.data || res.data)) || [];
          const last = Array.isArray(list) && list.length ? list[list.length - 1] : null;
          if (last) {
            // Đảm bảo có shareToken cho bản ghi mới nhất
            if (!last.shareToken) {
              const create = await axios.post(`${API_ENDPOINTS.MESSAGES}/${last.id}/share`);
              link = create.data?.data?.shareLink || null;
            }
            if (!link && last.shareToken) {
              link = `${API_BASE_URL}/share/${last.shareToken}`;
            }
          }
          // Nếu vẫn chưa có, fallback cây theo visitorToken
          if (!link) link = `${window.location.origin}/20_10/view.html?visitorToken=${vt}`;
        } catch {
          link = `${window.location.origin}/20_10/view.html?visitorToken=${vt}`;
        }
      }
    }
    if (!link) {
      notify && notify('Chưa có link chia sẻ. Hãy gửi một lời chúc trước nhé!', 'warning');
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      notify && notify('Đã copy link chia sẻ!', 'success');
    } catch {
      notify && notify('Không thể copy tự động. Link đã sẵn sàng để bạn copy thủ công.', 'info');
    }
  };
  return (
    <button className="share-floating-btn" onClick={handleClick}>🔗 Share</button>
  );
}
