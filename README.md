<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 学生科创发展蓝图 V2.3

**学生科创发展蓝图** 是一款创新的 AI 驱动应用，旨在帮助学生规划他们的科技创新之路。通过利用 Google Gemini 的强大功能，该应用可以生成个性化的发展蓝图，评估学生当前的学术和技能水平，并提供有针对性的改进建议。

## ✨ 功能

- **个性化评估**：根据学生的 GPA、技术技能、竞赛奖项、领导力和项目成果，生成全面的个人资料。
- **目标设定**：帮助学生设定明确的学术和职业目标，例如目标学校和专业。
- **差距分析**：将学生当前的个人资料与目标进行比较，并以直观的雷达图形式展示。
- **发展路线图**：提供详细的、可操作的步骤，以帮助学生弥合差距并实现目标。
- **PDF 导出**：将生成的蓝图导出为格式精美的 PDF 文档，以便于分享和参考。

## 🛠️ 技术栈

- **前端**：
  - [React](https://react.dev/)：用于构建用户界面的 JavaScript 库。
  - [Vite](https://vitejs.dev/)：下一代前端构建工具。
  - [Tailwind CSS](https://tailwindcss.com/)：一个功能类优先的 CSS 框架。
  - [Recharts](https://recharts.org/)：一个用于 React 的图表库。
- **AI**：
  - [Google Gemini](https://ai.google.dev/)：由 Google DeepMind 开发的一系列多模态模型。
- **PDF 生成**：
  - [html2canvas](https://html2canvas.hertzen.com/)：一个将网页部分或全部截图的 JavaScript 库。
  - [jspdf](https://parall.ax/products/jspdf)：一个用于在 JavaScript 中生成 PDF 的库。

## 🚀 本地运行

**先决条件**：[Node.js](https://nodejs.org/)

1. **克隆仓库**：
   ```bash
   git clone https://github.com/your-username/your-repository.git
   cd your-repository
   ```

2. **安装依赖**：
   ```bash
   npm install
   ```

3. **设置环境变量**：
   - 复制 `.env.example` 文件并重命名为 `.env.local`。
   - 在 `.env.local` 文件中设置您的 Gemini API 密钥：
     ```
     GEMINI_API_KEY=your_gemini_api_key
     ```

4. **运行应用**：
   ```bash
   npm run dev
   ```

   应用将在 `http://localhost:3000` 上可用。

## 📂 项目结构

```
.
├── public/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   ├── HistoryModal.tsx
│   │   ├── StepIndicator.tsx
│   │   └── VisualBlueprint.tsx
│   ├── services/
│   │   └── geminiService.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── types.ts
├── .env.local
├── .gitignore
├── index.html
├── package.json
├── README.md
├── tsconfig.json
└── vite.config.ts
```
