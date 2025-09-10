This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Deploying Locally

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Next run the backend server:

```bash
cd backend
python3 app.py
```

## Deploying on Firebase
🎉 Check out our deployment at https://wing-it-e6a3a.web.app/! 🎉

Backend: Backend powered by Google Cloud Functions (Firebase)
To update functions in the cloud:
```bash
//Note this is an example of updating a cloud function, make sure you are logged in first
firebase functions:delete saveResponse 
firebase deploy --only functions:saveResponse
```

