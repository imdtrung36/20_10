import { useState, useEffect, useRef } from "react";
import MessageForm from "./pages/MessageForm";
import MessagesList from "./pages/MessagesList";
import "./styles/index.css";

function App() {
  const [page, setPage] = useState("form");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const audioRef = useRef(null);

  // ✅ Play nhạc sau khi người dùng click bất kỳ (tránh lỗi autoplay + null)
  useEffect(() => {
    const handleFirstClick = () => {
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.warn("Autoplay bị chặn:", err));
      } else {
        console.warn("Audio chưa sẵn sàng khi click");
      }
      document.removeEventListener("click", handleFirstClick);
    };
    document.addEventListener("click", handleFirstClick);
    return () => document.removeEventListener("click", handleFirstClick);
  }, []);

  // ✅ Điều khiển bật / tắt nhạc
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return; // tránh lỗi null
    if (isPlaying) {
      audio.play().catch((err) => console.warn("Không thể phát:", err));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // ✅ Nút cuộn lên đầu
  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="app">
      {/* 🎵 Thẻ audio */}
      <audio
        ref={audioRef}
        id="bg-music"
        src={import.meta.env.BASE_URL + "music.mp3"}
        preload="auto"
      />

      {/* 🌸 Giao diện */}
      <header className="header">
        <h1 className="title">💐 Flower & Message 20/10</h1>
        <div className="menu">
          <button onClick={() => setPage("form")}>Gửi lời chúc</button>
          <button onClick={() => setPage("messages")}>Xem lời chúc</button>
        </div>
      </header>

      <main className="content">
        {page === "form" && <MessageForm />}
        {page === "messages" && <MessagesList />}
      </main>

      {/* 🎵 Nút bật/tắt nhạc */}
      <button
        className="music-btn"
        onClick={() => setIsPlaying(!isPlaying)}
        title={isPlaying ? "Tắt nhạc" : "Bật nhạc"}
      >
        {isPlaying ? "🔊 Tắt nhạc" : "🎵 Bật nhạc"}
      </button>

      {/* ⬆️ Nút cuộn lên đầu */}
      {showScroll && (
        <button
          className="scroll-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ⬆️
        </button>
      )}
    </div>
  );
}

export default App;
