import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { analyzeProfile, runLearningWorkflow } from "../src/agents.js";

const studentInput = {
  major: "计算机科学与技术",
  grade: "大二",
  goal: "两周内学懂神经网络基础，并能完成一个 PyTorch 手写数字识别实验",
  narrative:
    "我学过 Python 和高数，但线性代数比较薄弱，矩阵运算和反向传播容易混淆。我更喜欢图解、代码实操和短视频讲解。",
  quiz: {
    python: 82,
    calculus: 64,
    linearAlgebra: 42,
    machineLearning: 38
  },
  preferences: ["图解", "代码实操", "短视频"]
};

describe("student profile agent", () => {
  it("builds a multi-dimensional profile from natural language and quiz data", () => {
    const profile = analyzeProfile(studentInput);

    assert.equal(profile.major, "计算机科学与技术");
    assert.equal(profile.grade, "大二");
    assert.ok(profile.dimensions.length >= 6);
    assert.ok(profile.weakPoints.some((point) => point.includes("矩阵")));
    assert.ok(profile.resourcePreferences.includes("代码实操"));
  });
});

describe("multi-agent learning workflow", () => {
  it("coordinates seven agents and generates at least five personalized resources", () => {
    const workflow = runLearningWorkflow(studentInput);

    assert.equal(workflow.agents.length, 7);
    assert.ok(workflow.agents.every((agent) => agent.status === "completed"));
    assert.ok(workflow.resources.length >= 5);
    assert.deepEqual(
      workflow.resources.map((resource) => resource.type),
      ["个性化讲义", "知识点思维导图", "练习题与解析", "代码实操案例", "PPT/视频脚本"]
    );
  });

  it("creates a seven-day learning path with reasons and bound resources", () => {
    const workflow = runLearningWorkflow(studentInput);

    assert.equal(workflow.learningPath.length, 7);
    assert.ok(workflow.learningPath.every((day) => day.reason.length > 0));
    assert.ok(workflow.learningPath.every((day) => day.resources.length > 0));
  });

  it("returns an evaluation report that updates the student profile", () => {
    const workflow = runLearningWorkflow(studentInput);

    assert.ok(workflow.evaluation.masteryScore >= 0);
    assert.ok(workflow.evaluation.masteryScore <= 100);
    assert.ok(workflow.evaluation.recommendations.length >= 2);
    assert.ok(workflow.updatedProfile.weakPoints.includes("矩阵运算"));
  });
});
