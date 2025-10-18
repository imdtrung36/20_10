import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS, FALLBACK_DATA } from '../config/api';
import '../styles/Flowers.css';

export default function Flowers() {
  const [flowers, setFlowers] = useState([]);

  useEffect(() => {
    axios.get(API_ENDPOINTS.FLOWERS)
      .then(res => setFlowers(res.data))
      .catch(error => {
        console.warn('API not available, using fallback data:', error);
        setFlowers(FALLBACK_DATA.flowers);
      });
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
