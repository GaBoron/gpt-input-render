import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

let source = fs.readFileSync(new URL("../content-script.js", import.meta.url), "utf8");
source = source.replace(
  /  scan\(\);\r?\n  observer\.observe[\s\S]*?\r?\n\}\)\(\);\s*$/,
  "  globalThis.__cgumlTest = { renderMarkdown };\n})();"
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

console.log("render smoke test passed");
