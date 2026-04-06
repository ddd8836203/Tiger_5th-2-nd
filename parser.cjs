const fs = require('fs');

const text = fs.readFileSync('raw_input.txt', 'utf-8');

const BOOK_ID = 'od3';
const UNIT_ID = 'od3_7';

function parseReadingContent(text) {
  const parts = text.split(/Paragraph \d+/).slice(1);
  return parts.map((part, index) => {
    const seq = index + 1;
    const match = part.match(/(.*?)【中文翻譯】(.*)/s);
    if (match) {
      const eng = match[1].replace(/\d+$/g, '').trim();
      const chi = match[2].trim().replace(/\d+$/g, '').trim();
      return `${BOOK_ID}\t${UNIT_ID}\t${seq}\t${eng}\t${chi}\t\t`;
    }
  }).join('\n');
}

function parseGrammar(text) {
  // We have 2 rules
  const blocks = text.split(/文法 \d+:/).slice(1);
  return blocks.map(block => {
    const titleMatch = block.match(/(.*?)\n/);
    const title = titleMatch[1].trim();
    const engMatch = block.match(/English Explanation: (.*)/);
    const eng = engMatch ? engMatch[1].trim() : '';
    const chiMatch = block.match(/Chinese Explanation: (.*)/);
    const chi = chiMatch ? chiMatch[1].trim() : '';
    const examplesBlock = block.split(/Example Sentences:/)[1];
    
    // Split examples by looking for lines with Chinese translation in parentheses
    let exLines = [];
    if (examplesBlock) {
       exLines = examplesBlock.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !/^文法/.test(l) && !/^[0-9]+\./.test(l));
    }
    
    // Remove trailing numbers like " 6" from examples
    const examples = exLines.map(line => {
      return line.replace(/ \d+$/, '').trim();
    }).filter(line => line.includes('(')); // Only keep actual example lines
    
    const examplesJson = JSON.stringify(examples);
    return `${BOOK_ID}\t${UNIT_ID}\t${title}\t${eng}\t${chi}\t${examplesJson}`;
  }).join('\n');
}

function parseVocabulary(text) {
  const blocks = text.split(/\n\d+\. /).map(b => b.trim());
  // The first block might have some leading text, so we clean it
  blocks[0] = blocks[0].replace(/.*?(?=Second\n)/s, '');
  
  const result = [];
  for (let block of blocks) {
    if (!block.trim()) continue;
    
    const lines = block.split('\n').map(l => l.trim());
    const wordInfo = lines[0].split('\n')[0].replace(/^\d+\.\s*/, '').trim();
    const word = wordInfo;
    
    let pos='', chi='', brk='', trick='', scene='', collo='', img='', ctx_eng='', ctx_chi='', chant='', comp='';
    
    lines.forEach(line => {
      if (line.startsWith('POS:')) pos = line.replace('POS:', '').trim();
      if (line.startsWith('Chi:')) chi = line.replace('Chi:', '').trim();
      if (line.startsWith('Break:')) brk = line.replace('Break:', '').trim();
      if (line.startsWith('Trick:')) trick = line.replace('Trick:', '').trim();
      if (line.startsWith('Scene:')) scene = line.replace('Scene:', '').trim();
      if (line.startsWith('Collocation:')) collo = line.replace('Collocation:', '').trim();
      if (line.startsWith('Img:')) img = line.replace('Img:', '').trim();
      if (line.startsWith('Context_Eng:')) ctx_eng = line.replace('Context_Eng:', '').replace(/ \d+$/, '').trim();
      if (line.startsWith('Context_Chi:')) ctx_chi = line.replace('Context_Chi:', '').trim();
      if (line.startsWith('Chant:')) chant = line.replace('Chant:', '').trim();
      if (line.startsWith('Compare:')) comp = line.replace('Compare:', '').trim();
    });
    
    result.push(`${BOOK_ID}\t${UNIT_ID}\t${word}\t${pos}\t${chi}\t${brk}\t${trick}\t${scene}\t${collo}\t${img}\t${ctx_eng}\t${ctx_chi}\t${chant}\t${comp}`);
  }
  return result.join('\n');
}

function parseQuizzes(textArray) {
  return textArray.map(block => {
    // block like: "1. What help us plan our day?A) Stars B) Clocks C) Clouds D) Trees\n正確答案： B (Clocks)。原因： ...\n錯誤選項原因： ...\n難度： ★☆☆☆☆"
    const lines = block.split('\n').map(l=>l.trim());
    const qLine = lines[0].replace(/^\d+\.\s*/, '');
    let qParts = qLine.split('A)');
    if (qParts.length === 1) {
       // Maybe it's missing 'A)' ? 
       // In user input they all have A)
    }
    const question = qParts[0].trim();
    let optionsText = 'A)' + qParts[1];
    
    // Parse options A) B) C) D)
    let a = optionsText.match(/A\) (.*?)(?= B\)|$)/)[1].trim();
    let b = ''; if(optionsText.includes('B)')) b = optionsText.match(/B\) (.*?)(?= C\)|$)/)[1].trim();
    let c = ''; if(optionsText.includes('C)')) c = optionsText.match(/C\) (.*?)(?= D\)|$)/)[1].trim();
    let d = ''; if(optionsText.includes('D)')) d = optionsText.match(/D\) (.*)/)[1].trim();
    const options = [a,b,c,d].filter(x=>x);
    const optionsJson = JSON.stringify(options);
    
    let answer = '';
    let explanation = [];
    let difficulty = '';
    
    lines.forEach(l => {
      if (l.startsWith('正確答案：')) {
        // 用字母對應回 options 陣列取得精確的選項文字
        const letterMatch = l.match(/正確答案：\s*([A-D])/);
        if (letterMatch) {
          const letter = letterMatch[1];
          if(letter === 'A') answer = a;
          else if(letter === 'B') answer = b;
          else if(letter === 'C') answer = c;
          else if(letter === 'D') answer = d;
        }
        explanation.push(l);
      }
      if (l.startsWith('錯誤選項原因：')) {
        explanation.push(l);
      }
      if (l.startsWith('難度：')) {
        difficulty = l.replace('難度：', '').trim();
      }
    });
    
    const expStr = explanation.join('\\n').replace(/\d+$/, '').replace(/\[\d+\]\d*$/, '').trim(); // Remove trailing numbers like " 1" safely by matching at end, but actually let's just replace trailing space+num
    return `${BOOK_ID}\t${UNIT_ID}\t${question}\t${optionsJson}\t${answer}\t${difficulty}\t${expStr}`;
  }).join('\n');
}

// Extract sections using markers
const readingContentText = text.match(/(Paragraph 1.*?)(?=\d+\. What help us plan our day\?)/s)[1];

const readingQuizEndIndex = text.indexOf('文法 1:');
const readingQuizText = text.substring(text.indexOf('1. What help us plan our day?'), readingQuizEndIndex);
const rqBlocks = readingQuizText.split(/\n(?=\d+\. )/).filter(b => b.trim());

const grammarEndIndex = text.indexOf('1. Tomorrow is Tuesday.');
const grammarText = text.substring(readingQuizEndIndex, grammarEndIndex);

const grammarQuizEndIndex = text.indexOf('1. Second');
const grammarQuizText = text.substring(grammarEndIndex, grammarQuizEndIndex);
const gqBlocks = grammarQuizText.split(/\n(?=\d+\. )/).filter(b => b.trim());

const vocabEndIndex = text.indexOf('1. What word means 60 seconds?');
const vocabText = text.substring(grammarQuizEndIndex, vocabEndIndex);

const vocabQuizText = text.substring(vocabEndIndex);
const vqBlocks = vocabQuizText.split(/\n(?=\d+\. )/).filter(b => b.trim());

fs.writeFileSync('output_rc.tsv', parseReadingContent(readingContentText));
fs.writeFileSync('output_rq.tsv', parseQuizzes(rqBlocks));
fs.writeFileSync('output_gr.tsv', parseGrammar(grammarText));
fs.writeFileSync('output_voc.tsv', parseVocabulary(vocabText));
fs.writeFileSync('output_vq.tsv', parseQuizzes(vqBlocks));
fs.writeFileSync('output_gq.tsv', parseQuizzes(gqBlocks)); // Optional: grammar quizzes

console.log("Done");
