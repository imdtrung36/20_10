// API configuration for different environments
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Base URL for API calls
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000' 
  : 'https://your-backend-url.herokuapp.com'; // Replace with your actual backend URL

// API endpoints
export const API_ENDPOINTS = {
  MESSAGES: `${API_BASE_URL}/api/messages`,
  FLOWERS: `${API_BASE_URL}/api/flowers`,
  HEALTH: `${API_BASE_URL}/api/health`
};

// Fallback data for production when backend is not available
export const FALLBACK_DATA = {
  flowers: [
    {
      id: 1,
      name: "Hoa Hồng",
      emoji: "🌹",
      message: "Tình yêu và sự lãng mạn"
    },
    {
      id: 2,
      name: "Hoa Cúc",
      emoji: "🌼",
      message: "Sự trong sáng và hạnh phúc"
    },
    {
      id: 3,
      name: "Hoa Tulip",
      emoji: "🌷",
      message: "Sự hoàn hảo và tình yêu đích thực"
    },
    {
      id: 4,
      name: "Hoa Lavender",
      emoji: "🪻",
      message: "Sự thanh thản và bình yên"
    },
    {
      id: 5,
      name: "Hoa Hướng Dương",
      emoji: "🌻",
      message: "Sự lạc quan và năng lượng tích cực"
    }
  ],
  messages: [
    {
      id: 1,
      name: "Admin",
      message: "Chúc mừng ngày Phụ nữ Việt Nam 20/10! 💐",
      timestamp: new Date().toISOString()
    }
  ]
};
