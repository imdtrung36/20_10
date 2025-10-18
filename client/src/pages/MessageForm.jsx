import { useState } from 'react';
import axios from 'axios';
import '../styles/MessageForm.css';

export default function MessageForm() {
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
      const res = await axios.post('http://localhost:5000/api/messages', { name: name.trim(), message: message.trim() });
      if (res.data) {
        setCardMessage(message);
        setCardSender(name);
        setShowCard(true);
        setName('');
        setMessage('');
        setNotice('');
        
        // Tự động ẩn thiệp sau 3 giây
        setTimeout(() => {
          setShowCard(false);
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

      {/* Thiệp chúc mừng */}
      {showCard && (
        <div className="celebration-card-overlay" onClick={closeCard}>
          <div className="celebration-card" onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <h2>🎉 Chúc mừng!</h2>
              <button className="close-btn" onClick={closeCard}>×</button>
            </div>
            <div className="card-content">
              <div className="message-display">
                <p>"{cardMessage}"</p>
                <span className="sender">— {cardSender}</span>
              </div>
            </div>
            <div className="card-footer">
              <p>Lời chúc đã được gửi thành công! 💌</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
