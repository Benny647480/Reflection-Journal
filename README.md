📦 Repository Structure & Artifacts Included

1 Full-Stack Application Code:
             Frontend:React 18 + TypeScript + Tailwind CSS reflection composer, past entries manager, and mindful synthesis                         tools.
            Backend (server.ts): Express server implementing the resilient Gemini multi-tier fallback ladder (gemini-3.6-                                      flash → gemini-3.1-flash-lite → gemini-flash-latest → gemini-3.7-flash).

2 Database Security Rules (firestore.rules):
            Owner-bound access control isolating all user logs and interactions under /users/{userId}/* (request.auth != null             && request.auth.uid == userId).
            
3 Complete Deployment Guide (README.md):
            Step-by-step instructions for Google Cloud Run deployment via gcloud run deploy.
            Google Cloud Secret Manager integration and IAM bindings for GEMINI_API_KEY.
            Firestore security rules deployment steps and campaign verification labeling:
            --update-labels=dev-tutorial=cloud-run-ai-challenge.
            
4 Environment & App Configuration:
            Production build configurations (package.json, vite.config.ts, tsconfig.json).
            Client and server environment declarations (.env.example, firebase-applet-config.json).
