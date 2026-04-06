const fs = require('fs');

const rc = fs.readFileSync('output_rc.tsv', 'utf-8');
const rq = fs.readFileSync('output_rq.tsv', 'utf-8');
const gq = fs.readFileSync('output_gq.tsv', 'utf-8');
const gr = fs.readFileSync('output_gr.tsv', 'utf-8');
const voc = fs.readFileSync('output_voc.tsv', 'utf-8');
const vq = fs.readFileSync('output_vq.tsv', 'utf-8');



const tsvContent = `
# 表格 1：Reading_Content 
請貼在 A 欄到 G 欄 (Book_ID, Unit_ID, Sequence, Eng, Chi, Exp_Eng, Exp_Chi)
\`\`\`tsv
${rc.trim()}
\`\`\`

# 表格 2：Reading_Quiz (閱讀理解測驗)
請貼在 A 欄到 G 欄 (Book_ID, Unit_ID, Question, Options, Answer, Difficulty, Explanation)
\`\`\`tsv
${rq.trim()}
\`\`\`

# 表格 3：Grammar_Quiz (文法測驗)
請貼在 A 欄到 G 欄 (Book_ID, Unit_ID, Question, Options, Answer, Difficulty, Explanation)
\`\`\`tsv
${gq.trim()}
\`\`\`

# 表格 4：Grammar (文法規則)
請貼在 A 欄到 F 欄 (Book_ID, Unit_ID, Rule_Title, Eng_Exp, Chi_Exp, Examples)
\`\`\`tsv
${gr.trim()}
\`\`\`

# 表格 5：Vocabulary
請貼在 A 欄到 N 欄 (Book_ID, Unit_ID, Word, POS, Chi, Break, Trick, Scene, Collocation, Img, Context_Eng, Context_Chi, Chant, Compare)
\`\`\`tsv
${voc.trim()}
\`\`\`

# 表格 6：Vocab_Quiz (單字選擇題)
請貼在 A 欄到 G 欄 (Book_ID, Unit_ID, Question, Options, Answer, Difficulty, Explanation)
\`\`\`tsv
${vq.trim()}
\`\`\`
`.trim();

fs.writeFileSync('C:/Users/88695/.gemini/antigravity/brain/934476bb-2ca0-4271-a7ac-0f28f069b530/Oxford_Discover_3_TSV.md', tsvContent);
