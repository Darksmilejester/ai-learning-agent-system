# Contributing

感谢你愿意参与智学工坊。这个项目希望保持轻量、可运行、可解释，所有改动都应围绕“课程学习闭环”这个核心目标展开。

## 开始前

1. 查看现有 issue，确认是否已有相同问题。
2. 对较大的功能变更，先开 issue 说明动机、用户场景和验收标准。
3. Fork 仓库或创建功能分支。
4. 修改代码、补充测试和文档。
5. 提交 pull request，并填写 PR 模板。

## 本地开发

```bash
npm test
npm run serve
```

访问：

```text
http://localhost:5173
```

## 分支和提交

推荐分支命名：

- `feature/<short-name>`
- `fix/<short-name>`
- `docs/<short-name>`
- `test/<short-name>`

推荐提交格式：

- `feat: add course export flow`
- `fix: handle empty uploaded documents`
- `docs: update demo guide`
- `test: cover rag ranking edge case`

## PR 验收标准

PR 合并前应满足：

- `npm test` 通过。
- README 或 docs 已同步更新。
- UI 改动包含截图或说明。
- RAG、智能体流程或资源生成逻辑改动包含测试。
- 没有提交真实 API key、学生隐私数据或课程版权资料。

## Issue triage

维护者会按下面标签整理反馈：

- `bug`: 功能异常或测试失败。
- `enhancement`: 新功能或体验改进。
- `documentation`: README、教程、截图、示例资料。
- `good first issue`: 适合新贡献者。
- `needs reproduction`: 需要补充复现步骤。

## 安全和隐私

- 不要上传真实学生隐私数据。
- 不要提交未授权课程资料。
- 不要在 issue 或 PR 中暴露 API key。
- 如果发现安全问题，请通过维护者邮箱先私下说明。
