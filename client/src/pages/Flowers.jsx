import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Flowers.css';

export default function Flowers() {
  const [flowers, setFlowers] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/flowers').then(res => setFlowers(res.data));
  }, []);

  return (
    <div className="flowers-container">
      {flowers.map(f => (
        <div key={f.id} className="flower-card">
          <img src={f.image} alt={f.name} />
          <h2>{f.name}</h2>
          <p>{f.price.toLocaleString()} đ</p>
        </div>
      ))}
    </div>
  );
}
