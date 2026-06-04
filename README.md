# 智学工坊

个性化资源生成与学习多智能体系统原型，面向《人工智能导论》课程场景，展示学生画像、课程资料 RAG、多智能体协作、资源生成、路径规划、智能答疑和学习评估的完整闭环。

![桌面端 RAG 工作台](screenshots/desktop-rag.png)

## 项目状态

- 当前版本：`v0.2.0` 开源维护准备版。
- 运行形态：纯前端原型，本地浏览器运行，不依赖后端服务。
- 数据处理：上传的课程资料只在本地浏览器内解析和检索，刷新页面后不会持久保存。
- 适用场景：课程比赛演示、AI 教育产品原型验证、多智能体学习流程研究。

## 核心能力

- 学生画像：根据专业、年级、目标、基础、偏好和测验结果构建动态画像。
- 课程资料 RAG：支持 `.txt`、`.md`、`.markdown`、`.json`、`.csv` 文本资料上传，自动分块、建索引、检索 Top-K 片段并展示引用来源。
- 多智能体协作：画像分析、知识诊断、路径规划、资源生成、题库生成、答疑辅导、内容审核 7 个智能体协同工作。
- 个性化资源生成：生成讲义、思维导图、练习题、代码案例、PPT/视频脚本 5 类学习资源。
- 学习路径规划：围绕神经网络基础生成 7 天学习计划，并解释每一天的目标和资源。
- 智能答疑：结合课程知识点、学生薄弱点和 RAG 引用给出解释。
- 学习效果评估：输出掌握度、能力雷达和后续建议，并更新学生画像。

## 快速开始

要求：

- Node.js 18 或更高版本。
- Python 3，用于启动本地静态服务器。

运行：

```bash
npm test
npm run serve
```

浏览器访问：

```text
http://localhost:5173
```

## 演示流程

1. 选择“神经网络入门”学生样例。
2. 在“课程知识库 / RAG”区域点击“导入示例资料”，或上传文本型课程资料。
3. 输入检索问题，例如“反向传播为什么需要链式法则？”。
4. 点击“检索并更新流程”，查看 Top-K 片段、来源文件和相关度。
5. 点击“运行多智能体流程”，查看 7 个智能体如何生成画像、资源、答疑和评估。
6. 对比带 RAG 引用和无外部资料时的答疑结果，观察可追溯来源如何降低幻觉风险。

更多截图和讲解见 [docs/DEMO.md](docs/DEMO.md)。

## 项目结构

```text
.
├── index.html
├── styles.css
├── src/
│   ├── agents.js
│   ├── app.js
│   ├── courseData.js
│   └── rag.js
├── tests/
├── screenshots/
├── docs/
└── .github/
```

## 测试

```bash
npm test
```

测试覆盖：

- 学生画像与多智能体流程。
- RAG 文档解析、分块、索引、检索和引用回答。
- UI 契约，包括首屏工作台、上传控件、RAG 区域和响应式样式。

## Roadmap

完整规划见 [ROADMAP.md](ROADMAP.md)。近期重点：

- 接入真实大模型 API。
- 增加服务端 PDF/PPT/Word 解析。
- 增加持久化向量库。
- 增加教师端资源审核。
- 增加 PPTX、PDF、视频脚本导出。

## 贡献

欢迎通过 issue 和 pull request 参与。开始前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

适合新贡献者的方向：

- 补充课程样例资料。
- 改进 RAG 分块与检索策略。
- 增加 UI 可访问性测试。
- 增加导出能力。
- 翻译或改写英文文档。

## 维护者

- GitHub: [condidatefounder](https://github.com/condidatefounder)
- Email: condidatefound@gmail.com

维护职责包括：需求整理、issue triage、PR review、测试验证、版本发布、文档维护和 roadmap 更新。

## License

[MIT](LICENSE)

## Quickstart

- Add or clarify the Quickstart README note as a small docs-only change. Explain project purpose, quick start, demo flow, and contribution steps. Link screenshots and roadmap. Keep commands consistent with the Chinese README.
