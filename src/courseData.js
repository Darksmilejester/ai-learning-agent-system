export const courseKnowledge = {
  title: "人工智能导论",
  targetModule: "神经网络基础",
  concepts: [
    {
      id: "matrix",
      name: "矩阵运算",
      summary: "理解向量、矩阵乘法和维度变化，是学习神经网络前向传播的基础。",
      difficulty: "基础补强"
    },
    {
      id: "perceptron",
      name: "感知机与神经元模型",
      summary: "用加权求和、偏置和激活函数描述一个人工神经元的计算过程。",
      difficulty: "核心概念"
    },
    {
      id: "loss",
      name: "损失函数",
      summary: "用可计算的误差指标衡量模型预测与真实标签之间的差距。",
      difficulty: "核心概念"
    },
    {
      id: "gradient",
      name: "梯度下降",
      summary: "沿损失函数下降最快的方向迭代更新参数。",
      difficulty: "方法理解"
    },
    {
      id: "backpropagation",
      name: "反向传播",
      summary: "利用链式法则从输出层向前计算参数梯度。",
      difficulty: "综合难点"
    },
    {
      id: "pytorch",
      name: "PyTorch 实验",
      summary: "用深度学习框架完成手写数字识别等小型实践项目。",
      difficulty: "实践应用"
    }
  ],
  sourceNotes: [
    "课程大纲：人工智能导论第 4 章神经网络基础",
    "实验指导：基于 PyTorch 的 MNIST 手写数字识别",
    "题库标签：矩阵运算、梯度下降、反向传播、模型评估"
  ]
};

export const resourceTemplates = [
  "个性化讲义",
  "知识点思维导图",
  "练习题与解析",
  "代码实操案例",
  "PPT/视频脚本"
];

export const sampleCourseDocuments = [
  {
    name: "人工智能导论-神经网络讲义.md",
    text: `# 神经网络基础

矩阵运算是神经网络前向传播的基础。输入向量 x 与权重矩阵 W 相乘前，必须检查维度是否匹配，否则模型无法完成线性变换。

反向传播依赖链式法则。输出层的误差需要沿计算图逐层传回前面的参数，每一层都要保存局部梯度，最终完成权重更新。

损失函数用于衡量预测结果和真实标签之间的差距。梯度下降通过计算损失函数对参数的梯度，沿负梯度方向迭代更新参数。`
  },
  {
    name: "PyTorch-MNIST-实验指导.txt",
    text: `MNIST 手写数字识别实验通常包含数据加载、模型定义、损失函数、反向传播、优化器更新和测试评估。

学生需要理解张量 shape 的变化。例如输入图像可以展平为 784 维向量，经过线性层后输出 10 个类别分数。

实验报告应说明模型结构、训练轮次、准确率、错分样例和改进方向。`
  }
];
