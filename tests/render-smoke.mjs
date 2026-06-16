import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

let source = fs.readFileSync(new URL("../content-script.js", import.meta.url), "utf8");
source = source.replace(
  /  scan\(\);[\s\S]*?\r?\n\}\)\(\);\s*$/,
  "  globalThis.__cgumlTest = { renderMarkdown, isHeavyMessage };\n})();"
);

const sandbox = {
  console,
  MutationObserver: function MutationObserver() {
    this.observe = () => {};
  },
  window: { requestAnimationFrame: callback => callback() },
  document: {
    documentElement: {},
    querySelectorAll: () => []
  }
};

vm.createContext(sandbox);
vm.runInContext(source, sandbox);

const sample = "10.3 在 293.15 K 时，将直径为 $0.1\\ \\text{mm}$ 的玻璃毛细管插入乙醇中。已知该温度下乙醇的表面张力为 $22.3 \\times 10^{-3}\\ \\text{N}\\cdot\\text{m}^{-1}$，密度为 $789.4\\ \\text{kg}\\cdot\\text{m}^{-3}$，重力加速度为 $9.8\\ \\text{m}\\cdot\\text{s}^{-2}$。";
const html = sandbox.__cgumlTest.renderMarkdown(sample);

assert(!html.includes("\\text"), "text commands should not leak into rendered output");
assert(html.includes('<span class="cguml-mtext">mm</span>'));
assert(html.includes('<span class="cguml-mtext">N</span>'));
assert(html.includes('<span class="cguml-mtext">kg</span>'));
assert(html.includes("10<sup>-3</sup>"));

const temperatureSample = "11.31 某反应的速率方程为 $-\\text{dc}_A/\\text{dt}=kc_A^n$，其由相同初始浓度开始到转化率达 $20\\%$ 所需时间，在 $40\\text{ }^\\circ\\text{C}$ 时为 $15\\text{ min}$, $60\\text{ }^\\circ\\text{C}$ 时为 $3\\text{ min}$。试计算此反应的活化能。";
const temperatureHtml = sandbox.__cgumlTest.renderMarkdown(temperatureSample);

assert(!temperatureHtml.includes("\\circ"), "degree commands should not leak into rendered output");
assert(temperatureHtml.includes("<sup>°</sup>"));
assert(temperatureHtml.includes('<span class="cguml-mtext">C</span>'));
assert(temperatureHtml.includes('<span class="cguml-mtext">dc</span><sub><span class="cguml-math-var">A</span></sub>'));

const functionSample = "$\\ln k = -E_a/(RT)+\\log A,\\quad y=\\exp(-x),\\quad \\sin^2 x+\\cos^2 x=1,\\quad a\\leq b\\Rightarrow b\\geq a$";
const functionHtml = sandbox.__cgumlTest.renderMarkdown(functionSample);

assert(!/\\(ln|log|exp|sin|cos|leq|Rightarrow|geq)/.test(functionHtml), "common math commands should not leak into rendered output");
assert(functionHtml.includes('<span class="cguml-mop">ln</span>'));
assert(functionHtml.includes('<span class="cguml-mop">log</span>'));
assert(functionHtml.includes('<span class="cguml-mop">exp</span>'));
assert(functionHtml.includes("≤"));
assert(functionHtml.includes("⇒"));
assert(functionHtml.includes("≥"));

const broadSample = "$\\dfrac{1}{2}+\\binom{n}{k},\\quad \\varphi\\in A\\subseteq B,\\quad \\forall x\\exists y,\\quad A\\oplus B$";
const broadHtml = sandbox.__cgumlTest.renderMarkdown(broadSample);

assert(!/\\(dfrac|binom|varphi|in|subseteq|forall|exists|oplus)/.test(broadHtml), "broad common commands should not leak into rendered output");
assert(broadHtml.includes("φ"));
assert(broadHtml.includes("∈"));
assert(broadHtml.includes("⊆"));
assert(broadHtml.includes("∀"));
assert(broadHtml.includes("∃"));
assert(broadHtml.includes("⊕"));

const alignmentSample = "11.21 反应 $A+2B\\longrightarrow D$ 的速率方程为 $-\\text{dc}_A/\\text{dt}=kc_Ac_B$。$25\\text{ }^\\circ\\text{C}$ 时 $k=2\\times10^{-4}\\text{ dm}^3\\cdot\\text{mol}^{-1}\\cdot\\text{s}^{-1}$。";
const alignmentHtml = sandbox.__cgumlTest.renderMarkdown(alignmentSample);

assert(!/\\(longrightarrow|text|circ|times|cdot)/.test(alignmentHtml), "alignment sample commands should not leak into rendered output");
assert(alignmentHtml.includes('<span class="cguml-mrel">⟶</span>'));
assert(alignmentHtml.includes('<span class="cguml-mtext">dc</span>'));
assert(alignmentHtml.includes('<span class="cguml-mtext"> dm</span><sup>3</sup>'));
assert(alignmentHtml.includes("<sup>°</sup>"));

const longFormulaText = Array.from({ length: 90 }, (_, index) => `$x_${index}=\\ln k$`).join(" ");
assert(sandbox.__cgumlTest.isHeavyMessage(longFormulaText), "many formulas should defer automatic rendering");
assert(sandbox.__cgumlTest.isHeavyMessage(`${"a".repeat(12001)} $x$`), "very long messages should defer automatic rendering");
assert(!sandbox.__cgumlTest.isHeavyMessage(alignmentSample), "ordinary textbook prompts should still auto-render");

const looseFenceHtml = sandbox.__cgumlTest.renderMarkdown("``` text extra\nconst x = 1;\n```\n\n$\\ln x$");
assert(looseFenceHtml.includes("<pre"), "loose fenced code blocks should render as code");
assert(looseFenceHtml.includes('<span class="cguml-mop">ln</span>'));

const unterminatedFenceHtml = sandbox.__cgumlTest.renderMarkdown("``` text extra\nconst x = 1;\n$\\ln x$");
assert(unterminatedFenceHtml.includes("<pre"), "unterminated loose fenced code blocks should not hang");

const markdownSample = "#test\n\n##Test\n\n###TEst\n\n**blod** slim\n\n```python\nprint(\"Hello World\")\n```";
const markdownHtml = sandbox.__cgumlTest.renderMarkdown(markdownSample);

assert(markdownHtml.includes("<h1>test</h1>"));
assert(markdownHtml.includes("<h2>Test</h2>"));
assert(markdownHtml.includes("<h3>TEst</h3>"));
assert(markdownHtml.includes("<strong>blod</strong> slim"));
assert(markdownHtml.includes('<pre class="cguml-code"><code data-lang="python">print(&quot;Hello World&quot;)</code></pre>'));

console.log("render smoke test passed");
