const SUPPORTED_EXTENSIONS = ["txt", "md", "markdown", "json", "csv"];
const STOP_WORDS = new Set([
  "the",
  "and",
  "with",
  "for",
  "this",
  "that",
  "什么",
  "为什么",
  "需要",
  "如何",
  "以及",
  "一个",
  "哪些"
]);

function hashText(text) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
}

function getExtension(name) {
  const extension = name.includes(".") ? name.split(".").pop().toLowerCase() : "txt";
  return SUPPORTED_EXTENSIONS.includes(extension) ? extension : "txt";
}

function normalizeWhitespace(text) {
  return String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function tokenize(text) {
  const normalized = String(text ?? "").toLowerCase();
  const latinTokens = normalized.match(/[a-z0-9_+-]{2,}/g) ?? [];
  const cjkText = normalized.replace(/[^\u4e00-\u9fa5]/g, "");
  const cjkTokens = [];

  for (let index = 0; index < cjkText.length; index += 1) {
    cjkTokens.push(cjkText[index]);
    if (index < cjkText.length - 1) {
      cjkTokens.push(cjkText.slice(index, index + 2));
    }
    if (index < cjkText.length - 3) {
      cjkTokens.push(cjkText.slice(index, index + 4));
    }
  }

  return [...new Set([...latinTokens, ...cjkTokens].filter((token) => token.length > 0 && !STOP_WORDS.has(token)))];
}

export function parseCourseDocument(fileLike) {
  const name = fileLike?.name || "course-material.txt";
  const content = normalizeWhitespace(fileLike?.text ?? fileLike?.content ?? "");

  return {
    id: `doc-${hashText(`${name}:${content}`)}`,
    title: name,
    type: getExtension(name),
    content,
    size: content.length,
    uploadedAt: new Date(0).toISOString()
  };
}

function splitLongText(text, maxLength) {
  if (text.length <= maxLength) return [text];

  const sentences = text
    .split(/(?<=[。！？!?；;])\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
  const chunks = [];
  let current = "";

  for (const sentence of sentences.length > 0 ? sentences : [text]) {
    if ((current + sentence).length <= maxLength) {
      current = `${current}${sentence}`;
    } else {
      if (current) chunks.push(current);
      if (sentence.length > maxLength) {
        for (let index = 0; index < sentence.length; index += maxLength) {
          chunks.push(sentence.slice(index, index + maxLength));
        }
        current = "";
      } else {
        current = sentence;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

export function chunkDocument(document, options = {}) {
  const maxLength = options.maxLength ?? 220;
  const paragraphs = document.content
    .split(/\n{2,}|(?=^#{1,3}\s)/m)
    .map((item) => item.replace(/^#{1,6}\s*/, "").trim())
    .filter(Boolean);
  const rawChunks = paragraphs.flatMap((paragraph) => splitLongText(paragraph, maxLength));

  return rawChunks.map((text, index) => ({
    id: `${document.id}-chunk-${index + 1}`,
    documentId: document.id,
    sourceTitle: document.title,
    sourceType: document.type,
    chunkIndex: index + 1,
    text,
    tokens: tokenize(`${document.title} ${text}`),
    citationLabel: `${document.title}#片段${index + 1}`
  }));
}

export function buildKnowledgeIndex(documents, options = {}) {
  const chunks = documents.flatMap((document) => chunkDocument(document, options));

  return {
    documents,
    chunks,
    stats: {
      documentCount: documents.length,
      chunkCount: chunks.length,
      tokenCount: chunks.reduce((total, chunk) => total + chunk.tokens.length, 0)
    }
  };
}

function scoreChunk(chunk, queryTokens, queryText) {
  const chunkTokenSet = new Set(chunk.tokens);
  const overlap = queryTokens.filter((token) => chunkTokenSet.has(token)).length;
  const exactBoost = queryTokens.filter((token) => token.length >= 2 && chunk.text.includes(token)).length * 2;
  const titleBoost = queryTokens.filter((token) => token.length >= 2 && chunk.sourceTitle.includes(token)).length;
  const phraseBoost = chunk.text.includes(queryText.replace(/\s+/g, "")) ? 4 : 0;

  return overlap + exactBoost + titleBoost + phraseBoost;
}

export function retrieveRelevantChunks(index, query, topK = 3) {
  const queryText = normalizeWhitespace(query);
  const queryTokens = tokenize(queryText);

  return index.chunks
    .map((chunk) => ({
      ...chunk,
      score: scoreChunk(chunk, queryTokens, queryText)
    }))
    .filter((chunk) => chunk.score > 0)
    .sort((left, right) => right.score - left.score || left.chunkIndex - right.chunkIndex)
    .slice(0, topK)
    .map((chunk) => ({
      ...chunk,
      snippet: chunk.text.length > 120 ? `${chunk.text.slice(0, 118)}...` : chunk.text
    }));
}

export function composeRagAnswer(question, chunks) {
  if (!chunks || chunks.length === 0) {
    return {
      question,
      answer: "当前知识库没有检索到足够相关的课程片段，建议先上传课程大纲、讲义或实验指导书后再提问。",
      citations: []
    };
  }

  const evidence = chunks
    .slice(0, 2)
    .map((chunk) => chunk.snippet || chunk.text)
    .join(" ");

  return {
    question,
    answer: `根据已上传课程资料，${evidence}`,
    citations: chunks.map((chunk) => ({
      label: chunk.citationLabel,
      sourceTitle: chunk.sourceTitle,
      chunkId: chunk.id,
      score: chunk.score,
      snippet: chunk.snippet || chunk.text
    }))
  };
}

export function createIndexFromFiles(fileLikes, options = {}) {
  return buildKnowledgeIndex(fileLikes.map((fileLike) => parseCourseDocument(fileLike)), options);
}
