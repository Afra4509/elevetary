# Aeferalow API Gateway

A professional AI API Gateway platform built with Next.js, TailwindCSS, TypeScript, Prisma (PostgreSQL), and Node.js. It routes traffic intelligently between multiple upstream LLM providers while exposing a single, secure, OpenAI-compatible API to the end user.

## ✨ Features

- **Drop-in OpenAI Replacement**: 100% compatible with OpenAI client SDKs (Python, Node.js) and tools. Supports full streaming (SSE) and JSON mode.
- **Smart Routing**: 
  - **Round-Robin**: Distributes load evenly.
  - **Random**: Picks a random provider.
  - **Priority**: Cascades through providers (A -> B -> C) if the first fails.
- **Circuit Breaker**: Automatically marks unhealthy providers as offline and falls back to healthy ones.
- **Security & Auth**: API keys are hashed securely using `bcrypt`. Rate limiting and quota management built-in.
- **Admin Dashboard**: Full CRUD for Users, API Keys, system configuration, and request logs.
- **Playground**: Built-in chat UI to test the API with streaming support.
- **Status Page**: Live monitoring of upstream provider health, latency, and success rates.

---

## 🚀 Deployment Guide (Azure App Service)

Since the project uses **PostgreSQL**, it is highly optimized for Azure Deployment using *Azure Database for PostgreSQL* and *Azure App Service*.

### 1. Provision Database
1. Go to Azure Portal.
2. Create **Azure Database for PostgreSQL - Flexible Server**.
3. Allow public access to your IP or to Azure Services.
4. Copy the Connection String.

### 2. Configure Environment Variables
Copy `.env.example` to `.env` or set these in your Azure App Service Configuration:

```env
# Format: postgresql://[user]:[password]@[host]:5432/[database]?schema=public&sslmode=require
DATABASE_URL="postgresql://myuser:mypassword@my-server.postgres.database.azure.com:5432/aeferalow?schema=public&sslmode=require"

# Auth Secrets
JWT_SECRET="generate_a_random_64_char_string_here"
ADMIN_PASSWORD="your_secure_admin_password"

# Provider Keys (Hidden from end users)
PROVIDER_A_KEY="sk-..."
PROVIDER_B_KEY="sk-..."
PROVIDER_C_KEY="sk-..."
```

### 3. Deploy to Azure App Service
1. Create a **Web App** in Azure.
2. Under "Publish", select **Code**.
3. Under "Runtime stack", select **Node 22 LTS** (or Node 24 LTS).
4. Set up deployment via GitHub Actions or local Git push.
5. In App Service -> **Configuration**, add all the Environment Variables above.
6. Also add the following startup command in Azure Configuration so it runs migrations before starting:
   ```bash
   npx prisma db push && npm run start
   ```

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

Push the schema and seed the database:
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
- `GET /v1/me` - Get current session info (Dashboard UI)
- `GET /internal/health` - Trigger provider health checks

---

## 🔒 Security Architecture

1. **Provider Hiding**: Upstream API keys (`sk-...`) NEVER leave the server.
2. **Key Hashing**: Client API keys (`afr_...`) are hashed in the database using `bcrypt`. Only the prefix is stored in plaintext for identification.
3. **Stateless Sessions**: The dashboard uses secure `HttpOnly` JWT cookies for authentication.
4. **Rate Limiting**: Built-in memory rate limiter checks API keys and IP addresses per minute.

---
Built with ♥ for the Aeferalow Platform.
