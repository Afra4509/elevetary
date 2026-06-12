# Aeferalow API Gateway

A professional AI API Gateway platform built with **Next.js**, **TailwindCSS**, **TypeScript**, **Prisma (PostgreSQL)**, and **Node.js**. Featuring a stunning **Neubrutalist UI**, it intelligently routes traffic between multiple upstream LLM providers while exposing a single, secure, and OpenAI-compatible API to the end user.

## ✨ Core Features

- **Drop-in OpenAI Replacement**: 100% compatible with official OpenAI client SDKs (Python, Node.js) and third-party tools. Supports full streaming (Server-Sent Events) and JSON mode seamlessly.
- **Smart Load Balancing & Routing**: 
  - **Round-Robin**: Distributes load evenly across available providers to prevent rate limits.
  - **Random**: Picks a random healthy provider for each request.
  - **Priority**: Cascades through providers (A -> B -> C) if the primary provider fails or is degraded.
- **Circuit Breaker & Auto-Failover**: Automatically marks unhealthy upstream providers as offline and falls back to healthy ones without interrupting the user's stream.
- **Advanced Security & Auth**: 
  - Client API keys (`afr_...`) are cryptographically hashed using `bcrypt` before database storage.
  - Strict Rate Limiting and Quota Management (Token tracking) built-in per API Key.
- **Admin Dashboard (Neubrutalism UI)**: A beautiful, modern, brutalist-inspired dashboard offering full CRUD operations for Users, API Keys, system configuration, and request audit logs.
- **Interactive Playground**: Built-in chat UI to test the API with real-time streaming support, right from the dashboard.
- **Public Status Page**: Live monitoring of upstream provider health, latency, and success rates.

---

## 🚀 Deployment Guide (Vercel & Supabase)

Since this project uses **PostgreSQL**, it is highly optimized for serverless deployments using **Vercel** for the application and **Supabase** (or any Postgres provider) for the database.

### 1. Provision Database
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Navigate to Project Settings -> Database.
3. Copy the **Connection String (URI)** for Node.js. 

### 2. Configure Environment Variables
Copy `.env.example` to `.env` or set these in your Vercel Project Settings:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres.[project]:[password]@aws-0-region.pooler.supabase.com:6543/postgres"

# Auth Secrets
JWT_SECRET="generate_a_random_64_char_string_here"
ADMIN_PASSWORD="your_secure_admin_password"
NEXT_PUBLIC_APP_URL="https://api.yourdomain.com"

# Upstream Provider Keys (Hidden from end users)
PROVIDER_A_KEY="sk-..."
PROVIDER_B_KEY="sk-..."
PROVIDER_C_KEY="sk-..."
```

### 3. Deploy to Vercel
1. Push your code to a GitHub repository.
2. Import the project in Vercel.
3. Vercel will automatically detect the **Next.js** framework.
4. Add all the Environment Variables from Step 2 into Vercel's Environment Variables section.
5. The `vercel.json` and `package.json` are already configured to automatically run `prisma generate` and `next build`.
6. **Important**: Before the first run, ensure you push the database schema. You can do this locally using:
   ```bash
   DATABASE_URL="your_supabase_url" npx prisma db push
   DATABASE_URL="your_supabase_url" npm run db:seed
   ```
7. Click **Deploy**!

---

## 🛠️ Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL database (or use Docker via `docker-compose up -d`)

### 1. Setup Database
If you don't have PostgreSQL installed locally, run:
```bash
docker-compose up -d
```
This will start a Postgres instance on port `5432`.

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Prisma
Configure your `DATABASE_URL` in `.env` to point to your local DB:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aeferalow?schema=public"
```

Push the schema and seed the database with the default Admin user:
```bash
npx prisma db push
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Access the application at `http://localhost:3000`.

---

## 📚 API Usage

Users can interact with the API Gateway exactly like the OpenAI API.

**Base URL**: `https://api.yourdomain.com/v1`

### Python Example
```python
from openai import OpenAI

client = OpenAI(
    api_key="afr_your_api_key_here",
    base_url="https://api.yourdomain.com/v1"
)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello!"}],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")
```

### Supported Endpoints
- `GET /v1/models` - List available routed models
- `POST /v1/chat/completions` - Generate chat completions (supports streaming)
- `GET /api/dashboard/me` - Get current session info (Dashboard UI)
- `GET /api/internal/health` - Trigger provider health checks

---

## 🔒 Security Architecture

1. **Provider Hiding**: Upstream API keys (`sk-...`) NEVER leave the server. End users cannot see which provider served their request.
2. **Key Hashing**: Client API keys (`afr_...`) are hashed in the database using `bcrypt`. Only the prefix is stored in plaintext for identification. Full keys are shown only once upon creation.
3. **Stateless Sessions**: The dashboard uses secure `HttpOnly` JWT cookies for authentication, preventing XSS-based token theft.
4. **Rate Limiting**: Built-in memory rate limiter checks API keys and IP addresses per minute to prevent abuse.
5. **CORS & Edge Protection**: Properly configured CORS headers and Next.js Route Handler protections secure the internal APIs from unauthorized cross-origin requests.

---
*Built with ♥ for the Aeferalow Platform.*
