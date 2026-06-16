(() => {
  "use strict";

  const PROCESSED = "data-cguml-rendered";
  const RAW_CLASS = "cguml-raw";
  const RENDERED_CLASS = "cguml-rendered";
  const originalText = new WeakMap();

  const greek = {
    alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε", zeta: "ζ",
    eta: "η", theta: "θ", iota: "ι", kappa: "κ", lambda: "λ", mu: "μ",
    nu: "ν", xi: "ξ", pi: "π", rho: "ρ", sigma: "σ", tau: "τ",
    upsilon: "υ", phi: "φ", chi: "χ", psi: "ψ", omega: "ω",
    Gamma: "Γ", Delta: "Δ", Theta: "Θ", Lambda: "Λ", Xi: "Ξ", Pi: "Π",
    Sigma: "Σ", Phi: "Φ", Psi: "Ψ", Omega: "Ω"
  };

  const operators = {
    times: "×", cdot: "·", div: "÷", pm: "±", mp: "∓", le: "≤", ge: "≥",
    neq: "≠", approx: "≈", sim: "∼", infty: "∞", partial: "∂", nabla: "∇",
    to: "→", leftarrow: "←", rightarrow: "→", leftrightarrow: "↔",
    sum: "∑", prod: "∏", int: "∫", exists: "∃", forall: "∀", in: "∈",
    notin: "∉", subset: "⊂", subseteq: "⊆", cup: "∪", cap: "∩"
  };

  const textCommands = new Set(["text", "textrm", "textup", "textnormal", "mathrm", "operatorname"]);

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function hasRenderableSyntax(text) {
    return /(^|\n)\s{0,3}#{1,6}\s|\*\*|__|`|\[.+?\]\(.+?\)|(^|\n)\s*[-*+]\s|\$[^$\n]+\$|\\\(|\\\[|\$\$/m.test(text);
  }

  function renderMarkdown(source) {
    const lines = source.replace(/\r\n?/g, "\n").split("\n");
    const blocks = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (!line.trim()) {
        i += 1;
        continue;
      }

      const fence = line.match(/^```([A-Za-z0-9_-]+)?\s*$/);
      if (fence) {
        const lang = fence[1] || "";
        const code = [];
        i += 1;
        while (i < lines.length && !/^```\s*$/.test(lines[i])) {
          code.push(lines[i]);
          i += 1;
        }
        i += i < lines.length ? 1 : 0;
        blocks.push(`<pre class="cguml-code"><code data-lang="${escapeHtml(lang)}">${escapeHtml(code.join("\n"))}</code></pre>`);
        continue;
      }

      if (/^\$\$\s*$/.test(line.trim())) {
        const math = [];
        i += 1;
        while (i < lines.length && !/^\$\$\s*$/.test(lines[i].trim())) {
          math.push(lines[i]);
          i += 1;
        }
        i += i < lines.length ? 1 : 0;
        blocks.push(renderMath(math.join(" "), true));
        continue;
      }

      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        const level = heading[1].length;
        blocks.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
        i += 1;
        continue;
      }

      if (/^\s*>/.test(line)) {
        const quote = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) {
          quote.push(lines[i].replace(/^\s*>\s?/, ""));
          i += 1;
        }
        blocks.push(`<blockquote>${renderMarkdown(quote.join("\n"))}</blockquote>`);
        continue;
      }

      if (isTableStart(lines, i)) {
        const header = splitTableRow(lines[i]);
        const align = splitTableRow(lines[i + 1]).map(cell => {
          if (/^:-+:$/.test(cell)) return "center";
          if (/^-+:$/.test(cell)) return "right";
          return "left";
        });
        i += 2;
        const rows = [];
        while (i < lines.length && /\|/.test(lines[i]) && lines[i].trim()) {
          rows.push(splitTableRow(lines[i]));
          i += 1;
        }
        blocks.push(renderTable(header, align, rows));
        continue;
      }

      const list = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.+)$/);
      if (list) {
        const ordered = /\d/.test(list[2][0]);
        const items = [];
        while (i < lines.length) {
          const item = lines[i].match(/^(\s*)([-*+]|\d+[.)])\s+(.+)$/);
          if (!item || /\d/.test(item[2][0]) !== ordered) break;
          items.push(`<li>${renderInline(item[3])}</li>`);
          i += 1;
        }
        blocks.push(`<${ordered ? "ol" : "ul"}>${items.join("")}</${ordered ? "ol" : "ul"}>`);
        continue;
      }

      const paragraph = [];
      while (i < lines.length && lines[i].trim() && !isBlockStart(lines, i)) {
        paragraph.push(lines[i]);
        i += 1;
      }
      blocks.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    }

    return blocks.join("");
  }

  function isBlockStart(lines, index) {
    const line = lines[index] || "";
    return /^```/.test(line)
      || /^#{1,6}\s+/.test(line)
      || /^\s*>/.test(line)
      || /^(\s*)([-*+]|\d+[.)])\s+/.test(line)
      || /^\$\$\s*$/.test(line.trim())
      || isTableStart(lines, index);
  }

  function isTableStart(lines, index) {
    return Boolean(lines[index] && lines[index + 1]
      && /\|/.test(lines[index])
      && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[index + 1]));
  }

  function splitTableRow(line) {
    return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(cell => cell.trim());
  }

  function renderTable(header, align, rows) {
    const heads = header.map((cell, index) => `<th style="text-align:${align[index] || "left"}">${renderInline(cell)}</th>`).join("");
    const body = rows.map(row => `<tr>${row.map((cell, index) => `<td style="text-align:${align[index] || "left"}">${renderInline(cell)}</td>`).join("")}</tr>`).join("");
    return `<table><thead><tr>${heads}</tr></thead><tbody>${body}</tbody></table>`;
  }

  function renderInline(source) {
    let text = escapeHtml(source);
    const stash = [];
    const keep = html => {
      const token = `\u0000${stash.length}\u0000`;
      stash.push(html);
      return token;
    };

    text = text.replace(/`([^`]+)`/g, (_, code) => keep(`<code>${code}</code>`));
    text = text.replace(/\\\[((?:.|\n)+?)\\\]/g, (_, math) => keep(renderMath(unescapeEntities(math), true)));
    text = text.replace(/\\\((.+?)\\\)/g, (_, math) => keep(renderMath(unescapeEntities(math), false)));
    text = text.replace(/\$([^$\n]+)\$/g, (_, math) => keep(renderMath(unescapeEntities(math), false)));
    text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/__(.+?)__/g, "<strong>$1</strong>");
    text = text.replace(/\*([^*\s][^*]*?)\*/g, "<em>$1</em>");
    text = text.replace(/_([^_\s][^_]*?)_/g, "<em>$1</em>");
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>');
    text = text.replace(/\u0000(\d+)\u0000/g, (_, index) => stash[Number(index)] || "");
    return text;
  }

  function unescapeEntities(value) {
    return value
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&amp;", "&")
      .replaceAll("&quot;", '"');
  }

  function renderMath(tex, display) {
    const body = parseMath(tex.trim());
    return `<span class="cguml-math ${display ? "cguml-math-display" : "cguml-math-inline"}">${body}</span>`;
  }

  function parseMath(tex) {
    let i = 0;

    function parseUntil(stopChar) {
      const out = [];
      while (i < tex.length) {
        const ch = tex[i];
        if (stopChar && ch === stopChar) {
          i += 1;
          break;
        }
        if (ch === "\\") {
          out.push(parseCommand());
          continue;
        }
        if (ch === "^" || ch === "_") {
          i += 1;
          const part = parseAtom();
          out.push(ch === "^" ? `<sup>${part}</sup>` : `<sub>${part}</sub>`);
          continue;
        }
        if (ch === "{") {
          i += 1;
          out.push(`<span class="cguml-math-group">${parseUntil("}")}</span>`);
          continue;
        }
        if (/[A-Za-z]/.test(ch)) {
          out.push(`<span class="cguml-math-var">${escapeHtml(ch)}</span>`);
          i += 1;
          continue;
        }
        out.push(escapeHtml(ch));
        i += 1;
      }
      return out.join("");
    }

    function parseAtom() {
      if (tex[i] === "{") {
        i += 1;
        return parseUntil("}");
      }
      if (tex[i] === "\\") return parseCommand();
      const atom = tex[i] || "";
      i += atom ? 1 : 0;
      return escapeHtml(atom);
    }

    function parseRequiredArg() {
      while (tex[i] === " ") i += 1;
      if (tex[i] !== "{") return parseAtom();
      i += 1;
      return parseUntil("}");
    }

    function parseRawRequiredArg() {
      while (tex[i] === " ") i += 1;
      if (tex[i] !== "{") return parseRawAtom();
      i += 1;
      let depth = 1;
      let value = "";
      while (i < tex.length && depth > 0) {
        const ch = tex[i];
        if (ch === "{") {
          depth += 1;
          value += ch;
          i += 1;
          continue;
        }
        if (ch === "}") {
          depth -= 1;
          if (depth > 0) value += ch;
          i += 1;
          continue;
        }
        value += ch;
        i += 1;
      }
      return escapeHtml(value);
    }

    function parseRawAtom() {
      const atom = tex[i] || "";
      i += atom ? 1 : 0;
      return escapeHtml(atom);
    }

    function parseCommand() {
      i += 1;
      const nameMatch = tex.slice(i).match(/^[A-Za-z]+/);
      const name = nameMatch ? nameMatch[0] : tex[i] || "";
      i += name.length || 1;

      if (name === " " || name === "," || name === ":" || name === ";") {
        return '<span class="cguml-mspace"></span>';
      }
      if (name === "!") {
        return '<span class="cguml-mspace cguml-mspace-negative"></span>';
      }
      if (name === "{" || name === "}") {
        return escapeHtml(name);
      }
      if (name === "%" || name === "$" || name === "&" || name === "#") {
        return escapeHtml(name);
      }

      if (name === "frac") {
        const numerator = parseRequiredArg();
        const denominator = parseRequiredArg();
        return `<span class="cguml-frac"><span>${numerator}</span><span>${denominator}</span></span>`;
      }
      if (name === "sqrt") {
        const value = parseRequiredArg();
        return `<span class="cguml-sqrt"><span>${value}</span></span>`;
      }
      if (textCommands.has(name)) {
        return `<span class="cguml-mtext">${parseRawRequiredArg()}</span>`;
      }
      if (name === "quad") {
        return '<span class="cguml-mspace cguml-mspace-quad"></span>';
      }
      if (name === "qquad") {
        return '<span class="cguml-mspace cguml-mspace-qquad"></span>';
      }
      if (name === "left" || name === "right") {
        return "";
      }
      if (name === "cdots") return "⋯";
      if (name === "ldots") return "…";
      if (greek[name]) return greek[name];
      if (operators[name]) return operators[name];
      return escapeHtml(`\\${name}`);
    }

    return parseUntil("");
  }

  function findMessageBody(container) {
    const selectors = [
      ".whitespace-pre-wrap",
      "[class*='whitespace-pre-wrap']",
      "[class*='markdown']"
    ];
    for (const selector of selectors) {
      const candidate = container.querySelector(selector);
      if (candidate && !candidate.closest(`.${RENDERED_CLASS}`)) return candidate;
    }
    return container;
  }

  function renderUserMessage(container) {
    if (!(container instanceof HTMLElement) || container.hasAttribute(PROCESSED)) return;

    const body = findMessageBody(container);
    if (!body || body.closest("textarea, [contenteditable='true']")) return;

    const raw = body.innerText.trimEnd();
    if (!raw || !hasRenderableSyntax(raw)) return;

    originalText.set(container, raw);
    container.setAttribute(PROCESSED, "true");

    const wrapper = document.createElement("div");
    wrapper.className = RENDERED_CLASS;
    wrapper.innerHTML = renderMarkdown(raw);

    const toolbar = document.createElement("div");
    toolbar.className = "cguml-toolbar";
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.textContent = "Raw";
    toggle.addEventListener("click", () => {
      const showingRaw = wrapper.classList.toggle(RAW_CLASS);
      toggle.textContent = showingRaw ? "Render" : "Raw";
      wrapper.textContent = "";
      if (showingRaw) {
        const pre = document.createElement("pre");
        pre.textContent = originalText.get(container) || raw;
        wrapper.append(pre);
      } else {
        wrapper.innerHTML = renderMarkdown(originalText.get(container) || raw);
      }
    });
    toolbar.append(toggle);

    body.replaceChildren(toolbar, wrapper);
  }

  function scan() {
    document.querySelectorAll("[data-message-author-role='user']").forEach(renderUserMessage);
  }

  const observer = new MutationObserver(() => {
    window.requestAnimationFrame(scan);
  });

  scan();
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
