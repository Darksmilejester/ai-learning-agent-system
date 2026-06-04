import { runLearningWorkflow } from "./agents.js";
import { sampleCourseDocuments } from "./courseData.js";
import { buildKnowledgeIndex, parseCourseDocument, retrieveRelevantChunks } from "./rag.js";

const scenarios = {
  neural: {
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
  },
  exam: {
    major: "电子信息工程",
    grade: "大三",
    goal: "一周内完成期末复习，重点掌握搜索算法、机器学习基础和神经网络概念",
    narrative:
      "我需要快速复习人工智能导论，概念很多容易混淆，希望系统按考试重点生成题库、知识点总结和错题强化计划。",
    quiz: {
      python: 68,
      calculus: 71,
      linearAlgebra: 58,
      machineLearning: 46
    },
    preferences: ["题库", "知识总结", "错题复盘"]
  },
  project: {
    major: "软件工程",
    grade: "大二",
    goal: "完成一个能写进课程项目报告的神经网络小实验",
    narrative:
      "我更关心实操项目，Python 基础还可以，但不知道如何从数学公式过渡到 PyTorch 代码。希望获得代码案例、实验步骤和答辩 PPT。",
    quiz: {
      python: 86,
      calculus: 61,
      linearAlgebra: 55,
      machineLearning: 44
    },
    preferences: ["代码实操", "实验项目", "PPT"]
  }
};

let activeScenario = "neural";
const ragState = {
  documents: [],
  index: null,
  retrievedChunks: []
};

function $(selector) {
  return document.querySelector(selector);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function hydrateInput() {
  const scenario = scenarios[activeScenario];
  $("#scenarioInput").value = [
    `专业：${scenario.major}`,
    `年级：${scenario.grade}`,
    `目标：${scenario.goal}`,
    `描述：${scenario.narrative}`
  ].join("\n");
}

function readScenarioInput() {
  const base = scenarios[activeScenario];
  const raw = $("#scenarioInput").value.trim();
  return {
    ...base,
    narrative: raw || base.narrative
  };
}

function getRagContext() {
  if (!ragState.index || ragState.retrievedChunks.length === 0) return null;

  return {
    query: $("#ragQuery").value.trim(),
    chunks: ragState.retrievedChunks,
    indexStats: ragState.index.stats
  };
}

function renderRagStats() {
  const stats = ragState.index?.stats ?? { documentCount: 0, chunkCount: 0, tokenCount: 0 };
  $("#ragStats").innerHTML = `
    <div><strong>${stats.documentCount}</strong><span>资料</span></div>
    <div><strong>${stats.chunkCount}</strong><span>片段</span></div>
    <div><strong>${stats.tokenCount}</strong><span>索引词</span></div>
  `;
}

function renderRagResults() {
  if (ragState.retrievedChunks.length === 0) {
    $("#ragResults").innerHTML = `
      <div class="empty-state">
        <strong>等待检索</strong>
        <p>导入示例资料或上传课程资料后，输入问题即可查看带来源的 Top-K 片段。</p>
      </div>
    `;
    return;
  }

  $("#ragResults").innerHTML = ragState.retrievedChunks
    .map(
      (chunk) => `
        <article class="rag-card">
          <div>
            <strong>${escapeHtml(chunk.citationLabel)}</strong>
            <span>相关度 ${chunk.score}</span>
          </div>
          <p>${escapeHtml(chunk.snippet)}</p>
        </article>
      `
    )
    .join("");
}

function rebuildRagIndex() {
  ragState.index = buildKnowledgeIndex(ragState.documents);
  renderRagStats();
}

function runRetrieval() {
  if (!ragState.index || ragState.index.chunks.length === 0) {
    ragState.retrievedChunks = [];
    renderRagStats();
    renderRagResults();
    runActiveWorkflow();
    return;
  }

  const query = $("#ragQuery").value.trim() || "反向传播为什么需要链式法则？";
  ragState.retrievedChunks = retrieveRelevantChunks(ragState.index, query, 3);
  renderRagResults();
  runActiveWorkflow();
}

function loadSampleKnowledge() {
  ragState.documents = sampleCourseDocuments.map((document) => parseCourseDocument(document));
  rebuildRagIndex();
  runRetrieval();
}

async function handleFileUpload(event) {
  const files = Array.from(event.target.files ?? []);
  if (files.length === 0) return;

  const uploadedDocuments = await Promise.all(
    files.map(async (file) =>
      parseCourseDocument({
        name: file.name,
        text: await file.text()
      })
    )
  );
  ragState.documents = [...ragState.documents, ...uploadedDocuments];
  rebuildRagIndex();
  runRetrieval();
}

function renderProfile(profile) {
  const items = [
    ["专业/阶段", `${profile.major} · ${profile.grade}`],
    ["学习目标", profile.goal],
    ["知识基础", Object.entries(profile.knowledgeBase).map(([name, value]) => `${name}${value}`).join(" / ")],
    ["学习风格", profile.learningStyle],
    ["薄弱点", profile.weakPoints.join("、")],
    ["资源偏好", profile.resourcePreferences.join("、")],
    ["画像维度", `${profile.dimensions.length} 个维度`],
    ["当前进度", `${profile.progress}%`]
  ];

  $("#profilePanel").innerHTML = items
    .map(
      ([label, value]) => `
        <div class="profile-item">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>
      `
    )
    .join("");
}

function renderAgents(workflow) {
  const ragEnabled = workflow.ragContext?.chunks?.length > 0;
  const notes = [
    "抽取专业、目标、基础与偏好",
    "定位矩阵、梯度和反向传播风险",
    "安排 7 天阶段式学习顺序",
    ragEnabled ? "基于 RAG 证据生成资源" : "生成讲义、导图、案例和脚本",
    "生成分层练习与解析",
    ragEnabled ? "引用课程资料回答学习问题" : "基于课程资料回答学习问题",
    ragEnabled ? "检查 RAG 引用和难度匹配" : "检查来源、事实风险和难度匹配"
  ];

  $("#agentFlow").innerHTML = workflow.agents
    .map(
      (agent, index) => `
        <div class="agent-step">
          <small>Agent ${index + 1}</small>
          <strong>${escapeHtml(agent.name)}</strong>
          <span>${escapeHtml(notes[index])}</span>
        </div>
      `
    )
    .join("");
}

function renderDiagnosis(diagnosis) {
  $("#diagnosisPanel").innerHTML = diagnosis.concepts
    .map(
      (concept) => `
        <div class="diagnosis-item">
          <b>${escapeHtml(concept.name)} · ${escapeHtml(concept.priority)}优先级</b>
          <p>${escapeHtml(concept.summary)}</p>
          <p>${escapeHtml(concept.status)}</p>
        </div>
      `
    )
    .join("");
}

function renderSources(sources) {
  return `
    <ul class="source-list">
      ${sources.slice(0, 3).map((source) => `<li>${escapeHtml(source)}</li>`).join("")}
    </ul>
  `;
}

function renderResources(resources) {
  $("#resourcesGrid").innerHTML = resources
    .map(
      (resource) => `
        <article class="resource-card">
          <span class="resource-type">${escapeHtml(resource.type)}</span>
          <h3>${escapeHtml(resource.title)}</h3>
          <p>${escapeHtml(resource.content)}</p>
          ${renderSources(resource.sources)}
        </article>
      `
    )
    .join("");
}

function renderPath(path) {
  $("#pathTimeline").innerHTML = path
    .map(
      (item) => `
        <div class="path-item" data-day="${item.day}">
          <h3>${escapeHtml(item.topic)}</h3>
          <p>${escapeHtml(item.objective)}</p>
          <p>资源：${escapeHtml(item.resources.join("、"))}</p>
          <p>推荐理由：${escapeHtml(item.reason)}</p>
        </div>
      `
    )
    .join("");
}

function renderTutor(tutor) {
  $("#tutorPanel").innerHTML = `
    <p><strong>学生问题：</strong>${escapeHtml(tutor.question)}</p>
    <p><strong>系统回答：</strong>${escapeHtml(tutor.answer)}</p>
    <p><strong>引用来源：</strong>${escapeHtml(tutor.references.join("；"))}</p>
  `;
}

function renderEvaluation(evaluation, updatedProfile) {
  const radar = evaluation.radar
    .map(
      (item) => `
        <div class="metric-row">
          <strong>${escapeHtml(item.name)} ${item.value}%</strong>
          <div class="meter"><span style="width:${item.value}%"></span></div>
        </div>
      `
    )
    .join("");
  const recommendations = evaluation.recommendations
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  $("#evaluationPanel").innerHTML = `
    <div class="score-block">
      <div>
        <strong>${evaluation.masteryScore}</strong>
        <span>综合掌握度</span>
      </div>
    </div>
    ${radar}
    <ol class="recommendations">${recommendations}</ol>
    <div class="metric-row">
      <strong>画像已更新</strong>
      <p>学习进度提升至 ${updatedProfile.progress}%，仍需关注 ${escapeHtml(updatedProfile.weakPoints.join("、"))}。</p>
    </div>
  `;
}

export function renderWorkflow(workflow) {
  $("#agentCount").textContent = workflow.agents.length;
  $("#resourceCount").textContent = workflow.resources.length;
  $("#pathCount").textContent = workflow.learningPath.length;
  renderProfile(workflow.profile);
  renderAgents(workflow);
  renderDiagnosis(workflow.diagnosis);
  renderTutor(workflow.tutor);
  renderResources(workflow.resources);
  renderPath(workflow.learningPath);
  renderEvaluation(workflow.evaluation, workflow.updatedProfile);
}

function runActiveWorkflow() {
  renderWorkflow(runLearningWorkflow(readScenarioInput(), { ragContext: getRagContext() }));
}

document.addEventListener("DOMContentLoaded", () => {
  hydrateInput();
  renderRagStats();
  renderRagResults();
  loadSampleKnowledge();

  $("#runWorkflow").addEventListener("click", runActiveWorkflow);
  $("#loadSampleDocs").addEventListener("click", loadSampleKnowledge);
  $("#runRetrieval").addEventListener("click", runRetrieval);
  $("#courseUpload").addEventListener("change", handleFileUpload);
  $("#ragQuery").addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      runRetrieval();
    }
  });

  document.querySelectorAll("[data-scenario]").forEach((button) => {
    button.addEventListener("click", () => {
      activeScenario = button.dataset.scenario;
      document.querySelectorAll("[data-scenario]").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      hydrateInput();
      runActiveWorkflow();
    });
  });
});
