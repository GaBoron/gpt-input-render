# GPT 输入渲染器

[English](README.md) | 简体中文

这是一个轻量的 Manifest V3 浏览器扩展，用于在 ChatGPT 网页版的用户消息中渲染 Markdown 和常见 LaTeX 语法。

## 功能

- 监听 ChatGPT 消息更新，并识别 `data-message-author-role="user"` 的用户消息。
- 渲染标题、强调、链接、引用、列表、围栏代码块、行内代码和简单表格。
- 渲染常见 LaTeX 分隔符：`$...$`、`\\(...\\)`、`$$...$$` 和 `\\[...\\]`。
- 支持实用 LaTeX 子集：希腊字母、常见运算符、`\\ln`、`\\log`、`\\exp`、`\\sin` 等函数名、上下标、`^\\circ`、`\\frac{...}{...}`、`\\sqrt{...}`、`\\text{...}`、`\\mathrm{...}`、字体命令、重音和常见空白命令。
- 为每条已渲染的用户消息添加 `Raw` / `Render` 切换按钮。

该扩展没有运行时依赖，也不会把消息内容发送到任何地方。

## 安装

### Microsoft Edge 加载项

GPT 输入渲染器已提交到 Microsoft Edge 加载项，目前正在审核中。发布后会在这里补充商店安装链接。

### 手动安装

1. 下载名为 `gpt-input-render-v1.0.0.zip` 的 release 资产。
2. 将 zip 文件解压到本地文件夹。
3. 打开 `chrome://extensions` 或 `edge://extensions`。
4. 启用开发者模式。
5. 选择 `Load unpacked`。
6. 选择解压后的文件夹。
7. 打开或刷新 `https://chatgpt.com`。

## 示例输入

```text
## Derivative

For $f(x)=x^2$, we have:

$$
f'(x)=\lim_{h\to0}\frac{(x+h)^2-x^2}{h}=2x
$$

- Markdown lists render too
- **Bold** and `inline code` work
```

## 限制

这是一个轻量渲染器，不是完整的 Markdown 或 TeX 引擎。它有意避免远程脚本和构建工具，因此暂不支持矩阵、公式编号、`align` 和自定义宏等高级 LaTeX 环境。

## 开发

```powershell
node --check content-script.js
```

## 许可

MIT License。详见 [LICENSE](LICENSE)。

Copyright (c) 2026 GaBoron.

`GPT` 和 `ChatGPT` 是 OpenAI 的商标。本项目是独立浏览器扩展，并非 OpenAI 官方项目，也不代表获得 OpenAI 背书或赞助。
