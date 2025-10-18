import { useState, useRef } from "react";
import MessageForm from "./pages/MessageForm";
import MessagesList from "./pages/MessagesList";
import "./styles/index.css";

function App() {
  const [page, setPage] = useState("form");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

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

      <button className="music-btn" onClick={toggleMusic}>
        {isPlaying ? "🔊 Tắt nhạc" : "🎵 Bật nhạc"}
      </button>
    </div>
  );
}

export default App;
