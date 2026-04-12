// 語速儲存 key
const RATE_STORAGE_KEY = 'speechRate';

// 預設語速
export const SPEECH_RATES = [
  { label: '🐇 超快', value: 1.2 },
  { label: '🏃 正常', value: 1.0 },
  { label: '🚶 稍慢', value: 0.8 },
  { label: '🐢 慢速', value: 0.6 },
  { label: '🐌 超慢', value: 0.4 },
];

export const getSpeechRate = () => {
  const stored = localStorage.getItem(RATE_STORAGE_KEY);
  return stored ? parseFloat(stored) : 0.8;
};

export const setSpeechRate = (rate) => {
  localStorage.setItem(RATE_STORAGE_KEY, String(rate));
};

/**
 * 偵測文字是否主要為中文
 */
function isMostlyChinese(text) {
  const chineseChars = text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g);
  if (!chineseChars) return false;
  // 中文字數佔總字元數超過 30% 就視為中文
  return chineseChars.length / text.length > 0.3;
}

/**
 * 取得最佳的語音
 * Chrome 上 Google 聲音最自然，優先選用
 */
let cachedVoices = { en: null, zh: null };

function getBestVoice(lang) {
  const cacheKey = lang === 'zh' ? 'zh' : 'en';
  if (cachedVoices[cacheKey]) return cachedVoices[cacheKey];

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  let best = null;

  if (lang === 'zh') {
    // 中文語音偏好順序
    const zhPrefer = [
      'Google 國語（台灣）',      // Chrome 繁中
      'Google 普通话（中国大陆）',  // Chrome 簡中
      'Microsoft HanHan',         // Edge/Windows 繁中
      'Microsoft Yating',         // Windows 繁中
      'Microsoft Xiaoxiao',       // Windows 簡中
    ];
    for (const name of zhPrefer) {
      best = voices.find(v => v.name.includes(name));
      if (best) break;
    }
    if (!best) {
      best = voices.find(v => v.lang.startsWith('zh-TW')) 
          || voices.find(v => v.lang.startsWith('zh'));
    }
  } else {
    // 英文語音偏好順序
    const enPrefer = [
      'Google US English',        // Chrome 最自然
      'Google UK English Female', // Chrome 英式
      'Microsoft Aria',           // Edge 自然
      'Microsoft Jenny',          // Windows 11
      'Microsoft Zira',           // Windows 10
    ];
    for (const name of enPrefer) {
      best = voices.find(v => v.name.includes(name));
      if (best) break;
    }
    if (!best) {
      best = voices.find(v => v.lang === 'en-US') 
          || voices.find(v => v.lang.startsWith('en'));
    }
  }

  cachedVoices[cacheKey] = best;
  return best;
}

// 確保語音列表載入（Chrome 非同步載入語音）
if (window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = { en: null, zh: null };
  };
}

/**
 * 朗讀文字（自動偵測中英文，選最佳語音）
 * @param {string} text - 要朗讀的文字
 * @param {object} opts - 選項
 * @param {number} opts.rate - 語速覆寫
 * @param {function} opts.onEnd - 朗讀結束回調
 */
export const speakText = (text, opts = {}) => {
  if (!window.speechSynthesis || !text) return;
  if (!opts.skipCancel) window.speechSynthesis.cancel();

  const rate = opts.rate || getSpeechRate();
  const utterance = new SpeechSynthesisUtterance(text);

  const isChi = isMostlyChinese(text);
  utterance.lang = isChi ? 'zh-TW' : 'en-US';

  const voice = getBestVoice(isChi ? 'zh' : 'en');
  if (voice) utterance.voice = voice;

  utterance.rate = rate;
  utterance.pitch = 1.0; // 正常音高

  if (opts.onEnd) {
    utterance.onend = opts.onEnd;
  }
  if (opts.onError) {
    utterance.onerror = opts.onError;
  }

  window.speechSynthesis.speak(utterance);
};
