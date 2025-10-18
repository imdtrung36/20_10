import { useState, useEffect, useRef } from "react";
import MessageForm from "./pages/MessageForm";
import MessagesList from "./pages/MessagesList";
import "./styles/index.css";

function App() {
  const [page, setPage] = useState("form");
  const [isPlaying, setIsPlaying] = useState(true);
  const [showScroll, setShowScroll] = useState(false);
  const audioRef = useRef(null);

  // 🌸 hiệu ứng hoa rơi
  useEffect(() => {
    const createFlower = () => {
      const flower = document.createElement("div");
      flower.classList.add("flower");
      flower.innerText = ["🌸", "🌺", "🌷", "💮"][Math.floor(Math.random() * 4)];
      flower.style.left = Math.random() * 100 + "vw";
      flower.style.animationDuration = 4 + Math.random() * 3 + "s";
      document.body.appendChild(flower);
      setTimeout(() => flower.remove(), 7000);
    };
    const interval = setInterval(createFlower, 400);
    return () => clearInterval(interval);
  }, []);

  // 🎵 nhạc nền
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.play().catch(err => console.log("Không thể phát tự động:", err));
      } else {
        audio.pause();
      }
    }
  }, [isPlaying]);

  // Hiển thị nút lên đầu
  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🌸 Cánh hoa đào rơi
  useEffect(() => {
    const petalsContainer = document.createElement("div");
    petalsContainer.classList.add("petals");
    document.body.appendChild(petalsContainer);

    const createPetal = () => {
      const petal = document.createElement("div");
      petal.classList.add("petal");

      petal.style.left = Math.random() * 100 + "vw";
      petal.style.animationDuration = 6 + Math.random() * 5 + "s";
      petal.style.width = 8 + Math.random() * 10 + "px";
      petal.style.height = 8 + Math.random() * 10 + "px";
      petal.style.opacity = 0.6 + Math.random() * 0.4;

      petalsContainer.appendChild(petal);
      setTimeout(() => petal.remove(), 11000);
    };

    const interval = setInterval(createPetal, 250);
    return () => {
      clearInterval(interval);
      petalsContainer.remove();
    };
  }, []);

  return (
    <div className="app">
      <audio
        ref={audioRef}
        id="bg-music"
        src={import.meta.env.BASE_URL + "music.mp3"}
        onLoadedData={() => {
          if (isPlaying) audioRef.current.play().catch(() => {});
        }}
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

      <button
        className="music-btn"
        onClick={() => setIsPlaying(!isPlaying)}
        title={isPlaying ? "Tắt nhạc" : "Bật nhạc"}
      >
        {isPlaying ? "🔊 Tắt nhạc" : "🎵 Bật nhạc"}
      </button>

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
