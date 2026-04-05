import React, { useState, useEffect } from 'react';
import { fetchBaseData } from './api';
import LoadingOverlay from './components/LoadingOverlay';
import Home from './components/Home';
import StudyRoom from './components/StudyRoom';

function App() {
  const [baseData, setBaseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [studentSession, setStudentSession] = useState({
    studentName: '',
    bookId: '',
    unitId: '',
  });

  // 初始化時拉取所有的教材結構 (Books, Units, 還有題目表)
  useEffect(() => {
    const initApp = async () => {
      try {
        setIsLoading(true);
        const data = await fetchBaseData();
        setBaseData(data);
      } catch (e) {
        console.error(e);
        alert("資料載入失敗，我們遇到了小精靈搗亂，請重整頁面。");
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  const handleStartSession = (sessionData) => {
    setStudentSession(sessionData);
  };

  const handleReturnHome = () => {
    // 回到首頁但保留學生的名字，只要清除書本跟單元
    setStudentSession(prev => ({ ...prev, bookId: '', unitId: '' }));
  };

  return (
    <>
      {isLoading && <LoadingOverlay text="魔法讀取中..." />}
      
      {!isLoading && baseData && (
        !studentSession.bookId || !studentSession.unitId ? (
          <Home baseData={baseData} initialName={studentSession.studentName} onStart={handleStartSession} />
        ) : (
          <StudyRoom 
            baseData={baseData} 
            session={studentSession} 
            onReturnHome={handleReturnHome}
          />
        )
      )}
    </>
  );
}

export default App;
