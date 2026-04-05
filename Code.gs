/**
 * 兒童英語學習網頁 - GAS 後端 API
 * 
 * 部署教學：
 * 1. 在你的 Google 第一個 Sheet 裡面，建立以下 8 個工作表 (區分大小寫)：
 *    - Books
 *    - Units
 *    - Reading_Content
 *    - Vocabulary
 *    - Grammar_Rules
 *    - Grammar_Examples
 *    - Quizzes
 *    - Scores
 * 2. 點擊頂端選單「擴充功能」 -> 「Apps Script」
 * 3. 將本檔案所有的程式碼複製並貼上，覆蓋掉原有的 myFunction()
 * 4. 點擊右上角「部署」 -> 「新增部署作業」
 * 5. 類型選擇「網頁應用程式 (Web App)」
 * 6. 説明隨意填寫，執行身分選擇「我」，誰可以存取選擇「所有人」
 * 7. 點擊「部署」，授權存取帳號後，將得到的「網頁應用程式網址」複製下來
 * 8. 在前端專案的 `.env` 檔案中，將該網址填入 `VITE_API_URL`
 */

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 讀取所有需快取的資料表
    const booksData = getSheetData(ss, "Books");
    const unitsData = getSheetData(ss, "Units");
    const readingData = getSheetData(ss, "Reading_Content");
    const vocabData = getSheetData(ss, "Vocabulary");
    const grammarRulesData = getSheetData(ss, "Grammar_Rules");
    const grammarExamplesData = getSheetData(ss, "Grammar_Examples");
    const quizzesData = getSheetData(ss, "Quizzes");

    // 將資料結構化為前端好處理的格式
    let structuredData = {
      books: {},
      units: {}
    };

    // 1. 處理 Books
    booksData.forEach(book => {
      structuredData.books[book.Book_ID] = {
        id: book.Book_ID,
        name: book.Book_Name,
        units: []
      };
    });

    // 2. 處理 Units 及其關聯資料
    unitsData.forEach(unit => {
      const bookId = unit.Book_ID;
      const unitId = unit.Unit_ID;
      
      if (!structuredData.books[bookId]) return;
      structuredData.books[bookId].units.push(unitId);

      const unitKey = `${bookId}_${unitId}`;
      structuredData.units[unitKey] = {
        bookId: bookId,
        unitId: unitId,
        title: unit.Unit_Title,
        bigQuestion: unit.Big_Question,
        textData: [],
        grammarRules: {},
        vocabData: [],
        quizzes: {
          reading: [],
          grammar: [],
          vocab: []
        }
      };
    });

    // 3. 匯入 Reading_Content
    readingData.forEach(row => {
      const unitKey = `${row.Book_ID}_${row.Unit_ID}`;
      if (structuredData.units[unitKey]) {
        structuredData.units[unitKey].textData.push({
          id: row.Sequence,
          eng: row.Eng,
          chi: row.Chi,
          expEng: row.Exp_Eng,
          expChi: row.Exp_Chi
        });
      }
    });

    // 排序 Reading_Content
    Object.keys(structuredData.units).forEach(key => {
      structuredData.units[key].textData.sort((a, b) => a.id - b.id);
    });

    // 4. 匯入 Vocabulary
    vocabData.forEach(row => {
      const unitKey = `${row.Book_ID}_${row.Unit_ID}`;
      if (structuredData.units[unitKey]) {
        structuredData.units[unitKey].vocabData.push({
          word: row.Word,
          pos: row.POS,
          chi: row.Chi,
          break: row.Break || "",
          trick: row.Trick || "",
          scene: row.Scene || "",
          collocation: row.Collocation || "",
          img: row.Img || "",
          contextEng: row.Context_Eng || "",
          contextChi: row.Context_Chi || "",
          chant: row.Chant || "",
          compare: row.Compare || ""
        });
      }
    });

    // 5. 匯入 Grammar Rules
    grammarRulesData.forEach(row => {
      const unitKey = `${row.Book_ID}_${row.Unit_ID}`;
      if (structuredData.units[unitKey]) {
        structuredData.units[unitKey].grammarRules = {
          title: row.Rule_Title,
          desc: row.Rule_Desc,
          formulaPositive: row.Formula_Pos,
          formulaNegative: row.Formula_Neg,
          examples: []
        };
      }
    });

    // 6. 匯入 Grammar Examples
    grammarExamplesData.forEach(row => {
      const unitKey = `${row.Book_ID}_${row.Unit_ID}`;
      if (structuredData.units[unitKey] && structuredData.units[unitKey].grammarRules) {
        structuredData.units[unitKey].grammarRules.examples.push({
          sequence: row.Sequence,
          eng: row.Example_Eng,
          chi: row.Example_Chi,
          note: row.Example_Note
        });
      }
    });

    // 排序 Grammar Examples
    Object.keys(structuredData.units).forEach(key => {
      if (structuredData.units[key].grammarRules.examples) {
        structuredData.units[key].grammarRules.examples.sort((a, b) => a.sequence - b.sequence);
      }
    });

    // 7. 匯入 Quizzes
    quizzesData.forEach(row => {
      const unitKey = `${row.Book_ID}_${row.Unit_ID}`;
      if (structuredData.units[unitKey]) {
        const quizType = row.Quiz_Type; // "reading", "grammar", or "vocab"
        if (structuredData.units[unitKey].quizzes[quizType]) {
          structuredData.units[unitKey].quizzes[quizType].push({
            id: row.Quiz_ID,
            q: row.Question,
            options: [row.Option_0, row.Option_1, row.Option_2, row.Option_3],
            ans: parseInt(row.Correct_Index, 10),
            exp: row.Explanation || ""
          });
        }
      }
    });

    // 回傳成功 JSON
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: structuredData
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // 錯誤處理
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Scores");
    
    // 解析前端傳來的 JSON
    const postData = JSON.parse(e.postData.contents);
    
    // Timestamp, Student_Name, Book_ID, Unit_ID, Quiz_Type, Score, Total_Questions, Passed
    const timestamp = new Date();
    
    sheet.appendRow([
      timestamp,
      postData.studentName || "Unknown",
      postData.bookId || "",
      postData.unitId || "",
      postData.quizType || "",
      postData.score || 0,
      postData.totalQuestions || 0,
      postData.passed ? "Yes" : "No"
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Score recorded successfully!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 輔助函數：將 Sheet 的資料轉成 Array of Objects
 */
function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // 只有標題或全空

  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      // 去除結尾空格
      const key = String(header).trim();
      obj[key] = row[index];
    });
    return obj;
  });
}

// 供開發測試用，可以手動在 GAS 中執行 testOutput 來檢查是否有拿對
function testOutput() {
  const result = doGet();
  Logger.log(result.getContent());
}
