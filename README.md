# GPT Input Render

English | [简体中文](README.zh-CN.md)

A small Manifest V3 browser extension that renders Markdown and common LaTeX syntax inside user messages on ChatGPT web.

## Features

- Watches ChatGPT message updates and finds user messages with `data-message-author-role="user"`.
- Renders headings, emphasis, links, blockquotes, lists, fenced code blocks, inline code, and simple tables.
- Renders common LaTeX delimiters: `$...$`, `\\(...\\)`, `$$...$$`, and `\\[...\\]`.
- Supports a practical LaTeX subset: Greek letters, common operators, function names such as `\\ln`, `\\log`, `\\exp`, `\\sin`, superscripts, subscripts, degree commands such as `^\\circ`, `\\frac{...}{...}`, `\\sqrt{...}`, `\\text{...}`, `\\mathrm{...}`, font commands, accents, and common spacing commands.
- Adds a small `Raw` / `Render` toggle to each rendered user message.

This extension is dependency-free and does not send message content anywhere.

## Installation

1. Download the release asset named `gpt-input-render-v1.0.0.zip`.
2. Extract the zip file to a local folder.
3. Open `chrome://extensions` or `edge://extensions`.
4. Enable developer mode.
5. Choose `Load unpacked`.
6. Select the extracted folder.
7. Open or reload `https://chatgpt.com`.

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

## Development

```powershell
node --check content-script.js
```

## License

MIT License. See [LICENSE](LICENSE).

Privacy details are available in [PRIVACY.md](PRIVACY.md).

Copyright (c) 2026 GaBoron.

`GPT` and `ChatGPT` are trademarks of OpenAI. This project is an independent browser extension and is not affiliated with, endorsed by, or sponsored by OpenAI.
