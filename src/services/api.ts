// API Service - handles all backend communication
// In production, replace BASE_URL with your actual backend URL

const BASE_URL = "https://your-backend-api.com";

// Simulated JWT token storage
let authToken: string | null = null;

export const setToken = (token: string) => {
  authToken = token;
  localStorage.setItem("eco_token", token);
};

export const getToken = () => {
  if (!authToken) {
    authToken = localStorage.getItem("eco_token");
  }
  return authToken;
};

export const clearToken = () => {
  authToken = null;
  localStorage.removeItem("eco_token");
};

// Mock data for demo purposes
const mockHistory = [
  { id: "1", date: "2026-03-25", co2: 12.4, grade: "B", items: 8 },
  { id: "2", date: "2026-03-20", co2: 28.7, grade: "D", items: 15 },
  { id: "3", date: "2026-03-15", co2: 5.2, grade: "A", items: 6 },
  { id: "4", date: "2026-03-10", co2: 18.1, grade: "C", items: 11 },
];

const mockResult = {
  totalCO2: 14.8,
  grade: "B" as const,
  items: [
    { name: "Beef Steak (500g)", co2: 6.8 },
    { name: "Whole Milk (1L)", co2: 1.6 },
    { name: "Rice (1kg)", co2: 2.7 },
    { name: "Chicken Breast (400g)", co2: 1.9 },
    { name: "Tomatoes (500g)", co2: 0.7 },
    { name: "Cheese (200g)", co2: 1.1 },
  ],
};

const mockSwaps = [
  { original: "Beef Steak", swap: "Lentils", saveCO2: 5.9 },
  { original: "Whole Milk", swap: "Oat Milk", saveCO2: 0.9 },
  { original: "Rice", swap: "Potatoes", saveCO2: 1.5 },
  { original: "Cheese", swap: "Hummus", saveCO2: 0.6 },
];

// Simulated API calls with mock data
export const api = {
  login: async (email: string, password: string) => {
    await delay(800);
    if (!email || !password) throw new Error("Email and password required");
    const token = "mock_jwt_token_" + Date.now();
    setToken(token);
    return { token, user: { email } };
  },

  register: async (email: string, password: string) => {
    await delay(800);
    if (!email || !password) throw new Error("Email and password required");
    return { message: "Registration successful" };
  },

  uploadReceipt: async (_file: File) => {
    await delay(1500);
    return { receiptId: "receipt_" + Date.now() };
  },

  analyzeReceipt: async (_receiptId: string) => {
    await delay(2000);
    return mockResult;
  },

  getSwaps: async () => {
    await delay(500);
    return mockSwaps;
  },

  getHistory: async () => {
    await delay(600);
    return mockHistory;
  },

  logout: () => {
    clearToken();
  },
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type HistoryItem = (typeof mockHistory)[0];
export type ResultData = typeof mockResult;
export type SwapItem = (typeof mockSwaps)[0];
