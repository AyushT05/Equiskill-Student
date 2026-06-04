import Groq from "groq-sdk";

const MODEL = "openai/gpt-oss-120b";

let _groq = null;
function getGroq() {
    if (!_groq) {
        if (!process.env.GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY environment variable is missing.");
        }
        _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return _groq;
}

async function callGroq(prompt, responseFormat = "text", maxTokens = 5000) {
    const messages = [{ role: "user", content: prompt }];

    if (responseFormat === "json") {
        messages.unshift({
            role: "system",
            content: "You are a helpful AI assistant. Always respond with valid JSON only. No markdown, no preamble.",
        });
    }

    const completion = await getGroq().chat.completions.create({
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: maxTokens,
    });

    return completion.choices[0]?.message?.content ?? "";
}

export async function generateCourseOutline(topic, courseType, difficultyLevel) {
    const prompt = `Generate study material outline for "${topic}" (${courseType}, difficulty: ${difficultyLevel}).
Return JSON: { "course_name": "", "difficulty": "", "course_summary": "", "chapters": [{ "chapter_number": 1, "chapter_title": "", "chapter_summary": "", "topics": [] }] }
Keep chapter count between 4-6. Topics per chapter: 3-5.`;
    const text = await callGroq(prompt, "json", 1500);
    return JSON.parse(text);
}

export async function generateChapterNotes(chapter) {
    const chapterTitle = chapter?.chapter_title || chapter?.chapterTitle || "Chapter";
    const topics = Array.isArray(chapter?.topics) ? chapter.topics.join(", ") : "";

    const prompt = `Write university-level HTML study notes for chapter "${chapterTitle}", topics: ${topics}.

STRICT RULES — follow every one:
1. Output valid HTML fragments only. No <html>/<head>/<body>. No markdown (no *, **, ##, backticks).
2. Use <strong> not **bold**. Use <em> not *italic*. Use <h2>/<h3>/<h4> not ## headings.
3. Structure: <h2> chapter title, <h3 data-wiki-search="QUERY"> per topic, <h4> sub-points, <p> paragraphs, <ul>/<ol>/<li> lists.
4. TABLES: Use <table><thead><tbody> whenever comparing things, listing formula variables, showing pros/cons, or summarising steps. Do NOT use paragraphs for these.
5. DEFINITIONS: Wrap the key definition of each topic in <blockquote><p>...</p></blockquote>.
6. MATH: All formulas and Greek letters must use KaTeX — inline: \\(...\\), block: \\[...\\]. Never write raw symbols like β or Σ.
7. CODE: Wrap all code/pseudocode in <pre><code class="language-LANG">...</code></pre>. Never use backticks.
8. IMAGES: Every <h3> must have data-wiki-search="X" where X is the exact Wikipedia article title for a relevant technical diagram for that topic. Use the topic name itself when possible (e.g. "confusion matrix", "gradient descent", "decision tree"). Never use unrelated articles like "Dynkin diagram" or "Smith chart".

Output only the HTML. Nothing else.`;

    return await callGroq(prompt, "text", 4000);
}

export async function generateFlashcards(chapters) {
    const prompt = `Generate 12 flashcards for: ${chapters}. Return a JSON array: [{ "front": "question", "back": "answer" }]`;
    const text = await callGroq(prompt, "json", 2000);
    return JSON.parse(text);
}

export async function generateQuiz(chapters) {
    const prompt = `Generate 10 multiple-choice quiz questions for: ${chapters}. Return a JSON array: [{ "question": "", "options": ["A","B","C","D"], "answer": "", "explanation": "" }]`;
    const text = await callGroq(prompt, "json", 2500);
    return JSON.parse(text);
}

export async function generateQnA(chapters) {
    const prompt = `Generate 10 questions and detailed answers for: ${chapters}. Return JSON: { "question_bank": [{ "question_id": "1", "question": "", "answer": "" }] }`;
    const text = await callGroq(prompt, "json", 2500);
    return JSON.parse(text);
}
