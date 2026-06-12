# AI Task Hub

AI 驱动的任务完成平台 — 提交任务，AI 即刻完成。无需订阅，按次付费。

当前已上线 **AI 图片生成**（基于 OpenAI DALL·E 3）与 **AI 代码生成**（基于 GPT-4o mini），文档处理等能力规划中。

## 功能

- 🎨 **AI 图片生成**：支持三种尺寸（1024×1024 / 1024×1792 / 1792×1024）、标准与高清两档质量，单次最多 4 张
- 💻 **AI 代码生成**：支持 TypeScript、Python、Go 等 8 种语言，一键复制结果
- 💳 **按次透明计费**：生成前实时显示预计费用，无月费、无订阅
- 📋 **任务历史**：自动记录每次生成的参数、状态与费用（保存在浏览器本地）
- 🧪 **演示模式**：未配置 API Key 时自动返回占位结果，方便开发与体验

## 快速开始

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可使用。未配置 API Key 时运行在演示模式。

### 接入真实图片生成

复制 `.env.example` 为 `.env.local` 并填入你的 OpenAI API Key：

```bash
cp .env.example .env.local
```

```env
OPENAI_API_KEY=sk-...
```

重启开发服务器后即可调用 DALL·E 3 生成真实图片。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm start` | 启动生产服务器 |
| `npm run lint` | 代码检查 |

## 项目结构

```
src/
├── app/
│   ├── page.tsx              # 首页（落地页）
│   ├── generate/             # 图片生成页
│   ├── code/                 # 代码生成页
│   ├── pricing/              # 定价页
│   ├── tasks/                # 任务历史页
│   └── api/
│       ├── generate/         # 图片生成 API（Route Handler）
│       └── code/             # 代码生成 API（Route Handler）
├── components/               # Navbar / Footer
└── lib/
    ├── openai.ts             # OpenAI 客户端（图片 + Chat）
    ├── pricing.ts            # 定价表与费用计算
    ├── code.ts               # 代码生成语言列表
    └── tasks.ts              # 本地任务记录（localStorage）
```

## 技术栈

- [Next.js 16](https://nextjs.org)（App Router + Turbopack）
- React 19 · TypeScript · Tailwind CSS 4

## 路线图

- [x] AI 图片生成（DALL·E 3）
- [x] 按次计费与费用预估
- [x] 任务历史记录
- [x] 代码生成（GPT-4o mini）
- [ ] 用户账户与余额系统
- [ ] 文档处理（总结 / 翻译 / 分析）
