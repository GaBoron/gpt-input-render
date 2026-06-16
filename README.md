# ChatGPT User Markdown and LaTeX Renderer

A small Manifest V3 browser extension that renders Markdown and common LaTeX syntax inside user messages on ChatGPT web.

## What It Does

- Watches ChatGPT message updates and finds user messages with `data-message-author-role="user"`.
- Renders headings, emphasis, links, blockquotes, lists, fenced code blocks, inline code, and simple tables.
- Renders common LaTeX delimiters: `$...$`, `\\(...\\)`, `$$...$$`, and `\\[...\\]`.
- Supports a practical LaTeX subset: Greek letters, common operators, superscripts, subscripts, `\\frac{...}{...}`, `\\sqrt{...}`, `\\text{...}`, `\\mathrm{...}`, and common spacing commands.
- Adds a small `Raw` / `Render` toggle to each rendered user message.

This extension is dependency-free and does not send message content anywhere.

## Install Locally

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable developer mode.
3. Choose `Load unpacked`.
4. Select this folder:

   `C:\Users\GaBoron\Documents\Codex\2026-06-16\gpt-markdown-latex\chatgpt-user-renderer-extension`

5. Open or reload `https://chatgpt.com`.

## Example Input

```text
## Derivative

For $f(x)=x^2$, we have:

$$
f'(x)=\lim_{h\to0}\frac{(x+h)^2-x^2}{h}=2x
$$

- Markdown lists render too
- **Bold** and `inline code` work
```

## Limits

This is a lightweight renderer, not a full Markdown or TeX engine. It intentionally avoids remote scripts and build tooling, so advanced LaTeX environments such as matrices, equation numbering, `align`, and custom macros are not supported yet.

## Verify

```powershell
node --check content-script.js
node tests/render-smoke.mjs
```
