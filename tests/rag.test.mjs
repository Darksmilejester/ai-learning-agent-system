import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  buildKnowledgeIndex,
  chunkDocument,
  composeRagAnswer,
  parseCourseDocument,
  retrieveRelevantChunks
} from "../src/rag.js";

const neuralText = `
# 神经网络基础讲义

反向传播依赖链式法则。输出层的误差需要沿计算图逐层传回前面的参数，因此每一层都要保存局部梯度。

矩阵运算是前向传播的基础。输入向量 x 与权重矩阵 W 相乘前，必须检查维度是否匹配。

PyTorch 实验中，MNIST 手写数字识别通常包含数据加载、模型定义、损失函数、反向传播和优化器更新。
`;

describe("course RAG core", () => {
  it("parses uploaded course text into a named document", () => {
    const document = parseCourseDocument({
      name: "neural-network-notes.md",
      text: neuralText
    });

    assert.equal(document.title, "neural-network-notes.md");
    assert.equal(document.type, "md");
    assert.ok(document.content.includes("反向传播"));
    assert.ok(document.id.startsWith("doc-"));
  });

  it("chunks course documents with citation labels", () => {
    const document = parseCourseDocument({ name: "neural-network-notes.md", text: neuralText });
    const chunks = chunkDocument(document, { maxLength: 80 });

    assert.ok(chunks.length >= 3);
    assert.ok(chunks[0].citationLabel.includes("neural-network-notes.md"));
    assert.ok(chunks.every((chunk) => chunk.text.length <= 140));
  });

  it("builds an index and retrieves relevant chunks by query", () => {
    const document = parseCourseDocument({ name: "neural-network-notes.md", text: neuralText });
    const index = buildKnowledgeIndex([document]);
    const results = retrieveRelevantChunks(index, "反向传播 为什么 需要 链式法则", 3);

    assert.equal(index.stats.documentCount, 1);
    assert.ok(index.stats.chunkCount >= 3);
    assert.ok(results.length >= 1);
    assert.match(results[0].text, /反向传播|链式法则/);
    assert.ok(results[0].score > 0);
  });

  it("composes a cited answer from retrieved chunks", () => {
    const document = parseCourseDocument({ name: "neural-network-notes.md", text: neuralText });
    const index = buildKnowledgeIndex([document]);
    const results = retrieveRelevantChunks(index, "MNIST 实验 包含 什么", 2);
    const answer = composeRagAnswer("MNIST 实验包含什么？", results);

    assert.match(answer.answer, /MNIST|手写数字识别/);
    assert.ok(answer.citations.length >= 1);
    assert.ok(answer.citations[0].label.includes("neural-network-notes.md"));
  });
});
