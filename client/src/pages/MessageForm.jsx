import { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import '../styles/MessageForm.css';

export default function MessageForm({ onSubmitted }) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [showCard, setShowCard] = useState(false);
  const [cardMessage, setCardMessage] = useState('');
  const [cardSender, setCardSender] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !message.trim()) {
      setNotice('❌ Vui lòng nhập đầy đủ tên và lời chúc!');
      return;
    }
    
    try {
      const res = await axios.post(API_ENDPOINTS.MESSAGES, { name: name.trim(), message: message.trim() });
      if (res.data && res.data.success && res.data.data) {
        setCardMessage(message);
        setCardSender(name);
        setShowCard(true);
        setName('');
        setMessage('');
        setNotice('');
        // Phát tín hiệu để trang danh sách tự reload
        try { localStorage.setItem('lastMessageAddedAt', String(Date.now())); } catch {}
        
        // Copy link share cá nhân nếu backend trả về
        const link = res.data.data.shareLink;
        if (link) {
          try {
            await navigator.clipboard.writeText(link);
          } catch {}
          try { localStorage.setItem('lastShareLink', link); } catch {}
        }

        // Lưu visitorToken để nút share có thể lấy link nếu cần
        const vt = res.data.data.visitorToken;
        if (vt) {
          try { localStorage.setItem('visitorToken', vt); } catch {}
        }

        // Tự động ẩn thiệp sau 3 giây
        setTimeout(() => {
          setShowCard(false);
          // Chuyển sang trang xem lời chúc (không dùng Router)
          if (typeof onSubmitted === 'function') {
            onSubmitted();
          }
        }, 3000);
      }
    } catch (error) {
      setNotice('❌ Lỗi khi gửi tin nhắn. Vui lòng thử lại!');
      console.error('Error sending message:', error);
    }
  };

  const closeCard = () => {
    setShowCard(false);
  };

  return (
    <>
      <form className="message-form" onSubmit={handleSubmit}>
        <input 
          value={name} 
          onChange={e => setName(e.target.value)} 
          placeholder="Tên người gửi" 
          required
        />
        <textarea 
          value={message} 
          onChange={e => setMessage(e.target.value)} 
          placeholder="Nhập lời chúc..." 
          required
        />
        <button>Gửi lời chúc 💌</button>
        {notice && <p className="notice">{notice}</p>}
      </form>

      {/* Modal thiệp chúc mừng xuất hiện giữa màn hình */}
      {showCard && (
        <div className="celebration-card-overlay" onClick={closeCard} role="dialog" aria-label="Lời chúc">
          <div className="celebration-card" onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <h2>💌 Lời chúc</h2>
              <button className="close-btn" onClick={closeCard}>×</button>
            </div>
            <div className="card-content">
              <div className="message-display">
                <p>"{cardMessage}"</p>
                <span className="sender">— {cardSender}</span>
              </div>
            </div>
            <div className="card-footer">
              <p>Chúc bạn một ngày tốt lành! 🌸</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
