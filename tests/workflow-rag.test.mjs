import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { runLearningWorkflow } from "../src/agents.js";
import { buildKnowledgeIndex, parseCourseDocument, retrieveRelevantChunks } from "../src/rag.js";

const studentInput = {
  major: "计算机科学与技术",
  grade: "大二",
  goal: "两周内学懂神经网络基础",
  narrative: "我线性代数薄弱，想弄懂反向传播和 PyTorch 实验。",
  quiz: {
    python: 82,
    calculus: 64,
    linearAlgebra: 42,
    machineLearning: 38
  },
  preferences: ["图解", "代码实操"]
};

describe("workflow with uploaded course material", () => {
  it("injects retrieved course material citations into tutor and resources", () => {
    const document = parseCourseDocument({
      name: "uploaded-neural-notes.md",
      text: "反向传播需要链式法则，因为输出误差要沿计算图逐层传回参数。矩阵运算需要先检查输入向量与权重矩阵的维度。"
    });
    const index = buildKnowledgeIndex([document]);
    const chunks = retrieveRelevantChunks(index, "反向传播 为什么 需要 链式法则", 3);
    const workflow = runLearningWorkflow(studentInput, {
      ragContext: {
        query: "反向传播为什么需要链式法则？",
        chunks,
        indexStats: index.stats
      }
    });

    assert.ok(workflow.tutor.references.some((reference) => reference.includes("uploaded-neural-notes.md")));
    assert.ok(workflow.resources.every((resource) => resource.sources.some((source) => source.includes("uploaded-neural-notes.md"))));
    assert.ok(workflow.audit.checks.some((check) => check.includes("RAG")));
  });
});
