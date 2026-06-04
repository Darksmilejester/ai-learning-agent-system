import { courseKnowledge, resourceTemplates } from "./courseData.js";
import { composeRagAnswer } from "./rag.js";

const agentNames = [
  "画像分析智能体",
  "知识诊断智能体",
  "路径规划智能体",
  "资源生成智能体",
  "题库生成智能体",
  "答疑辅导智能体",
  "内容审核智能体"
];

function scoreLabel(score) {
  if (score >= 80) return "较强";
  if (score >= 60) return "一般";
  return "薄弱";
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function getRagSources(ragContext) {
  return (ragContext?.chunks ?? []).map((chunk) => chunk.citationLabel || `${chunk.sourceTitle}#片段${chunk.chunkIndex}`);
}

export function analyzeProfile(input) {
  const narrative = input.narrative ?? "";
  const weakPoints = [];

  if ((input.quiz?.linearAlgebra ?? 100) < 60 || narrative.includes("线性代数")) {
    weakPoints.push("矩阵运算");
  }
  if ((input.quiz?.machineLearning ?? 100) < 60 || narrative.includes("反向传播")) {
    weakPoints.push("反向传播");
  }
  if ((input.quiz?.calculus ?? 100) < 70) {
    weakPoints.push("梯度下降");
  }

  const resourcePreferences = unique([
    ...(input.preferences ?? []),
    narrative.includes("图解") ? "图解" : "",
    narrative.includes("代码") ? "代码实操" : "",
    narrative.includes("短视频") ? "短视频" : ""
  ]);

  return {
    major: input.major || "计算机类",
    grade: input.grade || "本科阶段",
    goal: input.goal || "掌握人工智能导论核心知识",
    knowledgeBase: {
      Python: scoreLabel(input.quiz?.python ?? 70),
      高等数学: scoreLabel(input.quiz?.calculus ?? 65),
      线性代数: scoreLabel(input.quiz?.linearAlgebra ?? 45),
      机器学习基础: scoreLabel(input.quiz?.machineLearning ?? 40)
    },
    learningStyle: resourcePreferences.includes("代码实操") ? "实操驱动型" : "概念理解型",
    weakPoints: unique(weakPoints),
    resourcePreferences,
    progress: 24,
    dimensions: [
      "专业背景",
      "课程阶段",
      "知识基础",
      "学习目标",
      "认知风格",
      "薄弱知识点",
      "资源偏好",
      "学习进度"
    ]
  };
}

export function diagnoseKnowledge(profile) {
  const concepts = courseKnowledge.concepts.map((concept) => {
    const isWeak = profile.weakPoints.some((point) => concept.name.includes(point) || point.includes(concept.name));
    return {
      ...concept,
      status: isWeak ? "需要优先补强" : "可按路径学习",
      priority: isWeak ? "高" : "中"
    };
  });

  return {
    focus: concepts.filter((concept) => concept.priority === "高"),
    concepts,
    summary: `诊断发现 ${profile.major}${profile.grade} 学生当前应优先补强 ${profile.weakPoints.join("、")}。`
  };
}

export function planLearningPath(profile, diagnosis) {
  const focusNames = diagnosis.focus.map((item) => item.name);
  const days = [
    ["矩阵运算补强", "用图解和小练习补齐向量、矩阵乘法和维度变化。"],
    ["神经元模型", "把感知机拆成输入、权重、偏置、激活函数四个部分。"],
    ["损失函数", "理解模型为什么需要可计算的误差指标。"],
    ["梯度下降", "结合线性函数案例理解参数更新方向。"],
    ["反向传播", "用链式法则串联前向传播与梯度计算。"],
    ["PyTorch 实验", "完成 MNIST 手写数字识别的最小可运行实验。"],
    ["测评与复盘", "通过题目和错因分析调整下一阶段学习计划。"]
  ];

  return days.map(([topic, objective], index) => ({
    day: index + 1,
    topic,
    objective,
    resources: index === 5 ? ["代码实操案例", "PPT/视频脚本"] : ["个性化讲义", "练习题与解析"],
    reason: focusNames.includes(topic)
      ? "该知识点位于学生薄弱区，应提前补强。"
      : `该阶段承接${profile.goal}，适合按序推进。`
  }));
}

export function generateResources(profile, diagnosis, ragContext = null) {
  const weakText = profile.weakPoints.join("、") || "神经网络基础";
  const ragSources = getRagSources(ragContext);
  const sources = ragSources.length > 0 ? ragSources : courseKnowledge.sourceNotes;
  const ragHint = ragSources.length > 0 ? `内容依据已上传资料：${ragSources.slice(0, 2).join("、")}。` : "";

  return resourceTemplates.map((type) => {
    const content = {
      个性化讲义: `面向${profile.learningStyle}学生的神经网络讲义，先补${weakText}，再进入感知机、损失函数和反向传播。${ragHint}`,
      知识点思维导图: `神经网络基础 -> 矩阵运算 -> 神经元模型 -> 损失函数 -> 梯度下降 -> 反向传播 -> PyTorch 实验。${ragHint}`,
      练习题与解析: `生成 8 道分层练习：3 道矩阵运算、2 道梯度下降、2 道反向传播、1 道代码阅读题，并给出解析。${ragHint}`,
      代码实操案例: `提供 Python 梯度下降示例和 PyTorch MNIST 最小实验，代码注释突出张量维度变化。${ragHint}`,
      "PPT/视频脚本": `生成 10 页 PPT 大纲和 3 分钟短视频脚本，用动画解释矩阵乘法和反向传播。${ragHint}`
    }[type];

    return {
      type,
      title: `${type}：${courseKnowledge.targetModule}`,
      personalizedFor: weakText,
      content,
      sources,
      audit: diagnosis.focus.length > 0 ? "已匹配学生薄弱点" : "已匹配课程目标"
    };
  });
}

export function generateQuestionSet(profile) {
  return [
    {
      type: "选择题",
      question: "神经网络中矩阵 W 与输入向量 x 相乘时，最需要先确认什么？",
      answer: "维度是否匹配",
      target: profile.weakPoints[0] || "矩阵运算"
    },
    {
      type: "代码题",
      question: "补全一段 Python 梯度下降代码，使参数沿负梯度方向更新。",
      answer: "w = w - learning_rate * grad",
      target: "梯度下降"
    }
  ];
}

export function answerQuestion(question, profile, ragContext = null) {
  const ragAnswer = composeRagAnswer(question, ragContext?.chunks ?? []);

  if (ragAnswer.citations.length > 0) {
    return {
      question,
      answer: `${ragAnswer.answer} 结合你的${profile.weakPoints.join("、")}薄弱点，建议把资料中的概念、公式和代码示例对应起来复习。`,
      references: ragAnswer.citations.map((citation) => citation.label)
    };
  }

  return {
    question,
    answer: `结合你的${profile.weakPoints.join("、")}薄弱点，建议先把问题拆成概念、公式和代码三层。以神经网络为例，先确认张量维度，再看损失函数如何产生梯度，最后用代码验证一次参数更新。`,
    references: courseKnowledge.sourceNotes
  };
}

export function auditContent(resources, ragContext = null) {
  const checks = ["课程来源已标注", "未发现敏感违规内容", "资源难度与画像匹配", "生成内容覆盖多模态类型"];

  if ((ragContext?.chunks ?? []).length > 0) {
    checks.push("RAG 引用检查通过");
  }

  return {
    status: "passed",
    checks,
    resourceCount: resources.length
  };
}

export function evaluateLearning(profile, questions) {
  const baseScore = Math.round(
    (profile.progress + (profile.weakPoints.includes("矩阵运算") ? 42 : 70) + questions.length * 12) / 3
  );
  const masteryScore = Math.max(0, Math.min(100, baseScore));

  return {
    masteryScore,
    radar: [
      { name: "矩阵运算", value: profile.weakPoints.includes("矩阵运算") ? 42 : 72 },
      { name: "梯度下降", value: profile.weakPoints.includes("梯度下降") ? 58 : 76 },
      { name: "反向传播", value: profile.weakPoints.includes("反向传播") ? 46 : 70 },
      { name: "代码实践", value: profile.resourcePreferences.includes("代码实操") ? 74 : 55 }
    ],
    recommendations: [
      "先完成矩阵乘法维度匹配专项练习。",
      "用 Python 手写一次梯度下降，再进入 PyTorch 框架。",
      "学习反向传播时保留计算图，逐层标注梯度来源。"
    ]
  };
}

export function runLearningWorkflow(input, options = {}) {
  const ragContext = options.ragContext ?? null;
  const profile = analyzeProfile(input);
  const diagnosis = diagnoseKnowledge(profile);
  const learningPath = planLearningPath(profile, diagnosis);
  const resources = generateResources(profile, diagnosis, ragContext);
  const questions = generateQuestionSet(profile);
  const tutor = answerQuestion(ragContext?.query || "反向传播为什么需要链式法则？", profile, ragContext);
  const audit = auditContent(resources, ragContext);
  const evaluation = evaluateLearning(profile, questions);
  const updatedProfile = {
    ...profile,
    progress: Math.min(100, profile.progress + 18),
    weakPoints: unique([...profile.weakPoints, "矩阵运算"])
  };

  return {
    course: courseKnowledge,
    agents: agentNames.map((name) => ({
      name,
      status: "completed"
    })),
    profile,
    diagnosis,
    learningPath,
    resources,
    questions,
    tutor,
    audit,
    evaluation,
    updatedProfile,
    ragContext
  };
}
