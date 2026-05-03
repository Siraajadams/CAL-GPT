# CalGPT Web App

A designed and functional calorie tracking web app with:

- Registration and login demo
- EHR profile capture
- Calorie tracker
- Meal photo upload
- ChatGPT / OpenAI food image analysis API route
- Diet plans and portion recommendations
- Weight tracker
- Local browser storage for demo use

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

```bash
http://localhost:3000
```

## Activate live food image analysis

Add your OpenAI key to `.env.local`:

```bash
OPENAI_API_KEY=your_api_key_here
```

The endpoint is:

```bash
POST /api/analyze-food
```

## Important production notes

This is a functional MVP starter. Before handling real patient data or EHR records, add:

- Proper database: PostgreSQL / Supabase / Firebase
- Real authentication: NextAuth / Clerk / Supabase Auth
- Encryption at rest
- POPIA/GDPR consent flows
- Audit logs
- Role-based access control
- Secure file storage
- Clinical disclaimer and doctor review workflow
