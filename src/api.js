/**
 * src/api.js
 * 這是與 GAS 後端溝通的主要模組
 */

const API_URL = import.meta.env.VITE_API_URL;

// 為了開發時能順利載入畫面，我準備了一個 mock fallback，等實際串接 GAS 時替換
import { mockData } from './mockData';

export const fetchBaseData = async () => {
  if (!API_URL || API_URL.includes("YOUR_GAS_DEPLOYMENT_ID")) {
    console.warn("未設定 VITE_API_URL 或尚未替換有效網址，將使用本地測試資料 (Mock Data)。");
    return new Promise(resolve => setTimeout(() => resolve(mockData), 1500));
  }

  try {
    const response = await fetch(`${API_URL}?action=getData`, {
      method: 'GET',
      mode: 'cors'
    });
    
    // GAS 可能回傳 redirect，fetch API 會自動追蹤
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const json = await response.json();
    if (json.status === "success") {
      return json.data;
    } else {
      throw new Error(json.message || "Unknown error from GAS");
    }
  } catch (error) {
    console.error("抓取資料時發生錯誤：", error);
    throw error;
  }
};

export const postScore = async (scoreRecord) => {
  if (!API_URL || API_URL.includes("YOUR_GAS_DEPLOYMENT_ID")) {
    console.warn("未設定 VITE_API_URL，送出成績將被忽略：", scoreRecord);
    return new Promise(resolve => setTimeout(() => resolve({ status: 'mock_success' }), 1000));
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scoreRecord),
    });

    return { status: "success" };
  } catch (error) {
    console.error("上傳成績時發生錯誤：", error);
    throw error;
  }
};

/**
 * 送出逐題答題紀錄到 Question_Log
 */
export const postQuestionLog = async ({ studentName, bookId, unitId, quizType, results }) => {
  // 同時存到 localStorage
  const localKey = `questionLog_${studentName}`;
  const stored = JSON.parse(localStorage.getItem(localKey) || '{}');
  const statKey = `${bookId}_${unitId}_${quizType}`;
  if (!stored[statKey]) stored[statKey] = {};

  results.forEach(r => {
    const q = r.question;
    if (!stored[statKey][q]) stored[statKey][q] = { wrong: 0, correct: 0 };
    if (r.isCorrect) {
      stored[statKey][q].correct++;
    } else {
      stored[statKey][q].wrong++;
    }
  });
  localStorage.setItem(localKey, JSON.stringify(stored));

  if (!API_URL || API_URL.includes("YOUR_GAS_DEPLOYMENT_ID")) {
    console.warn("Mock 模式：答題紀錄已存至 localStorage", stored);
    return { status: 'mock_success' };
  }

  try {
    await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "logQuestions",
        studentName,
        bookId,
        unitId,
        quizType,
        results
      }),
    });
    return { status: "success" };
  } catch (error) {
    console.error("上傳答題紀錄失敗：", error);
    return { status: "error" };
  }
};

/**
 * 取得學生的答題統計（優先用 localStorage，背景同步 GAS）
 */
export const getQuestionStats = (studentName) => {
  const localKey = `questionLog_${studentName}`;
  return JSON.parse(localStorage.getItem(localKey) || '{}');
};

