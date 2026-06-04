import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

describe("competition app UI contract", () => {
  it("renders the learning system workspace as the first screen", async () => {
    const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

    assert.match(html, /id="app"/);
    assert.match(html, /id="scenarioInput"/);
    assert.match(html, /id="agentFlow"/);
    assert.match(html, /id="resourcesGrid"/);
    assert.match(html, /id="pathTimeline"/);
    assert.match(html, /id="evaluationPanel"/);
    assert.doesNotMatch(html, /购买|立即注册|营销|landing/i);
  });

  it("renders course upload and RAG retrieval controls", async () => {
    const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

    assert.match(html, /id="courseUpload"/);
    assert.match(html, /id="loadSampleDocs"/);
    assert.match(html, /id="ragQuery"/);
    assert.match(html, /id="runRetrieval"/);
    assert.match(html, /id="ragResults"/);
    assert.match(html, /id="ragStats"/);
  });

  it("defines responsive styling and app rendering code", async () => {
    const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
    const app = await readFile(new URL("../src/app.js", import.meta.url), "utf8");

    assert.match(css, /@media/);
    assert.match(css, /--ink/);
    assert.match(css, /\.rag-panel/);
    assert.match(app, /runLearningWorkflow/);
    assert.match(app, /renderWorkflow/);
    assert.match(app, /retrieveRelevantChunks/);
  });
});
