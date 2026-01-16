# Smart Shopper AI (formerly TinyFish)

> A premium, AI-powered price comparison platform built with Next.js 14 and Mino AI.

Smart Shopper AI helps users find the best deals across the web by analyzing millions of products using advanced AI. It supports both natural language text search and image-based product discovery.

## 🚀 Features

-   **AI-Powered Search**: Natural language understanding to find exactly what you're looking for.
-   **Image Search**: Upload a photo to find similar products across retailers.
-   **Real-Time Data**: Live price extraction from major retailers (Amazon, eBay, Walmart, etc.) using Mino AI.
-   **Price Monitoring**: Track price changes and history (Database powered).
-   **Modern UI**: Beautiful, responsive dark-mode interface with glassmorphism effects.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Database**: [Prisma](https://www.prisma.io/) (SQLite)
-   **AI Integration**: [Mino AI](https://mino.ai/) API
-   **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

### Prerequisites

-   Node.js 18+
-   npm

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Aadi-Kulhar/smartshopperai.git
    cd smartshopperai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```bash
    DATABASE_URL="file:./dev.db"
    MINO_API_KEY="your-mino-api-key"
    ```

4.  **Setup Database**
    ```bash
    npx prisma db push
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000)

## 📦 Deployment

The application is optimized for deployment on **Vercel**.

1.  Push your code to GitHub.
2.  Import the project in Vercel.
3.  Add the environment variables (`MINO_API_KEY`).
4.  *Note: For production database, replace SQLite with Vercel Postgres or another provider.*

## 📄 License

MIT
