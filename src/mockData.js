export const mockData = {
  books: {
    "od3": { id: "od3", name: "Oxford Discover 3", units: ["u7"] },
    "rad5": { id: "rad5", name: "Read and Discover 5", units: ["u8"] },
    "grammar3": { id: "grammar3", name: "Grammar 3", units: ["u9"] }
  },
  units: {
    "od3_u7": {
      bookId: "od3", unitId: "u7", title: "Oxford Discover 3 - Unit 7: Time and the Earth", bigQuestion: "BIG QUESTION 4: How do we measure time?",
      textData: [
        { id: 1, eng: "What time is it? That's a very good question! From morning until night, clocks help us to plan our day. They tell us when things begin and when they end.", chi: "現在幾點了？這是一個非常好的問題！從早到晚，時鐘幫助我們規劃一天。它們告訴我們事情何時開始，何時結束。", expEng: "Clocks are like our daily helpers. They show us the time so we know exactly when to eat, go to school, or sleep.", expChi: "時鐘就像我們日常的小幫手。它們告訴我們時間，讓我們確切知道什麼時候該吃飯、上學或睡覺。" }
      ],
      grammarRules: {
        title: "Future Facts with Will (表達未來的客觀事實)", desc: "在這個單元，我們要掌握時間的魔法字： will （將會）。", formulaPositive: "主角 + will + 動詞原形", formulaNegative: "主角 + won't (will not 的縮寫) + 動詞原形",
        examples: [ { sequence: 1, eng: "In two hours, it will be noon where you live.", chi: "兩個小時後，你住的地方將會是正午。", note: "表示時間自然推進的事實" } ]
      },
      vocabData: [
        { word: "second", pos: "n.", chi: "秒", break: "sec(切分) + ond", trick: "「賽肯」：賽車肯花一秒加速就能贏！", img: "⏱️", contextEng: "Wait a second.", contextChi: "等一下。", chant: "Tick tock second, don't be a millisecond!" },
        { word: "minute", pos: "n.", chi: "分鐘", break: "min(小) + ute", trick: "「迷你特」：一分鐘的時間很迷你", img: "⏳", contextEng: "I will be there in a minute.", contextChi: "我馬上就來。", chant: "Wait a minute, push it to the limit!" }
      ],
      quizzes: {
        reading: [
          { id: "r1", q: "What do clocks help us do?", options: ["Eat more food", "Plan our day", "Sleep all day", "Move the sun"], ans: 1, exp: "Clocks help us plan our day." }
        ],
        grammar: [
          { id: "g1", q: "Tomorrow _____ be Tuesday.", options: ["will", "won't", "is", "are"], ans: 0, exp: "will fact." }
        ],
        vocab: [
          { id: "v1", q: "Tick tock! Which is the shortest amount of time?", options: ["year", "hour", "minute", "second"], ans: 3, exp: "second is shortest." }
        ]
      }
    }
  }
};
