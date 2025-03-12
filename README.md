# AI Tax Assistant

An AI-powered tax assistant that helps users understand and analyze Indian tax documents. Built with Next.js and Claude AI.

## Features

- 📄 Document Analysis: Upload and analyze tax documents (Form 16, ITR, etc.)
- 🖼️ Image Support: Upload images of tax documents for analysis
- 💬 Interactive Chat: Ask questions about Indian taxation
- 📊 Smart Formatting: Enhanced display of numbers, percentages, and currency values
- 🔒 Secure: No document storage, direct processing with Claude AI

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Anthropic Claude AI
- Vercel AI SDK

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Shubham1992/ai-taxes.git
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your Anthropic API key:
```
ANTHROPIC_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

- `ANTHROPIC_API_KEY`: Your Anthropic API key for Claude AI

## License

MIT
