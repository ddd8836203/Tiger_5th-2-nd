const fs = require('fs');

function verify(file, label, expectedCols) {
  const lines = fs.readFileSync(file, 'utf-8').split('\n').filter(l => l.trim());
  console.log(`\n===== ${label} =====`);
  console.log(`行數: ${lines.length}`);
  
  let errors = [];
  lines.forEach((l, i) => {
    const cols = l.split('\t');
    if (cols.length !== expectedCols) {
      errors.push(`Row ${i+1}: 欄數=${cols.length}, 預期=${expectedCols}`);
    }
    // Check Book_ID, Unit_ID
    if (cols[0] !== 'od3') errors.push(`Row ${i+1}: Book_ID='${cols[0]}' 不是 'od3'`);
    if (cols[1] !== 'od3_7') errors.push(`Row ${i+1}: Unit_ID='${cols[1]}' 不是 'od3_7'`);
  });

  if (errors.length === 0) {
    console.log(`✅ 全部 ${lines.length} 行通過基本檢查 (每行 ${expectedCols} 欄)`);
  } else {
    console.log(`❌ 發現 ${errors.length} 個錯誤:`);
    errors.forEach(e => console.log('  ', e));
  }

  // Show first & last row summary
  if (lines.length > 0) {
    const first = lines[0].split('\t');
    const last = lines[lines.length - 1].split('\t');
    console.log(`  第1行: ${first[2]?.substring(0, 50)}...`);
    console.log(`  最後行: ${last[2]?.substring(0, 50)}...`);
  }
  return lines;
}

// 1. Reading_Content: Book_ID, Unit_ID, Sequence, Eng, Chi, Exp_Eng, Exp_Chi = 7 cols
verify('output_rc.tsv', 'Reading_Content', 7);

// 2. Reading_Quiz: Book_ID, Unit_ID, Question, Options(JSON), Answer, Difficulty, Explanation = 7 cols
const rqLines = verify('output_rq.tsv', 'Reading_Quiz', 7);
// Validate Options is valid JSON and Answer is in options
rqLines.forEach((l, i) => {
  const cols = l.split('\t');
  try {
    const opts = JSON.parse(cols[3]);
    if (!Array.isArray(opts) || opts.length < 2) {
      console.log(`  ⚠️ RQ Row ${i+1}: Options 不是有效陣列: ${cols[3].substring(0, 50)}`);
    }
    if (!opts.includes(cols[4])) {
      console.log(`  ⚠️ RQ Row ${i+1}: Answer '${cols[4]}' 不在 Options 中: ${JSON.stringify(opts)}`);
    }
  } catch (e) {
    console.log(`  ❌ RQ Row ${i+1}: Options JSON 解析失敗: ${cols[3]?.substring(0, 50)}`);
  }
  if (!cols[5] || !cols[5].includes('★')) {
    console.log(`  ⚠️ RQ Row ${i+1}: Difficulty 欄位異常: '${cols[5]}'`);
  }
  if (!cols[6] || cols[6].length < 10) {
    console.log(`  ⚠️ RQ Row ${i+1}: Explanation 太短或空白`);
  }
});

// 3. Grammar: Book_ID, Unit_ID, Rule_Title, Eng_Exp, Chi_Exp, Examples(JSON) = 6 cols
const grLines = verify('output_gr.tsv', 'Grammar', 6);
grLines.forEach((l, i) => {
  const cols = l.split('\t');
  try {
    const ex = JSON.parse(cols[5]);
    console.log(`  文法 ${i+1} '${cols[2].substring(0,40)}' => ${ex.length} 個例句`);
    ex.forEach((e, j) => console.log(`    ${j}: ${e.substring(0, 70)}`));
  } catch (e) {
    console.log(`  ❌ Grammar Row ${i+1}: Examples JSON 解析失敗`);
  }
});

// 4. Vocabulary: 14 cols
verify('output_voc.tsv', 'Vocabulary', 14);

// 5. Vocab_Quiz: 7 cols
const vqLines = verify('output_vq.tsv', 'Vocab_Quiz', 7);
vqLines.forEach((l, i) => {
  const cols = l.split('\t');
  try {
    const opts = JSON.parse(cols[3]);
    if (!opts.includes(cols[4])) {
      console.log(`  ⚠️ VQ Row ${i+1}: Answer '${cols[4]}' 不在 Options 中`);
    }
  } catch (e) {
    console.log(`  ❌ VQ Row ${i+1}: Options JSON 解析失敗`);
  }
});

// 6. Grammar_Quiz: 7 cols
const gqLines = verify('output_gq.tsv', 'Grammar_Quiz', 7);
gqLines.forEach((l, i) => {
  const cols = l.split('\t');
  try {
    const opts = JSON.parse(cols[3]);
    if (!opts.includes(cols[4])) {
      console.log(`  ⚠️ GQ Row ${i+1}: Answer '${cols[4]}' 不在 Options 中`);
    }
  } catch (e) {
    console.log(`  ❌ GQ Row ${i+1}: Options JSON 解析失敗`);
  }
});

console.log('\n===== 驗證完成 =====');
