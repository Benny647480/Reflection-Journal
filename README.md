# Reflection Journal

A secure, user-authenticated reflection and journaling web application powered by **Gemini 3.6 Flash** and **Google Cloud Firestore**.

---

## 🛡️ Architecture & Threat Modeling Countermeasures

| Threat Zone | Identified Risk | Mitigation Countermeasure |
| :--- | :--- | :--- |
| **Input Surfaces** | Prompt injection & malformed JSON payloads | Strict schema validation, plain-data isolation, and length bounds. |
| **Planning & Reasoning** | LLM hallucination or model downtime | Resilient 4-tier model fallback ladder (`gemini-3.6-flash` &rarr; `gemini-3.1-flash-lite` &rarr; `gemini-flash-latest` &rarr; `gemini-3.7-flash`). |
| **Tool & API Execution** | Unauthorized API access | Server-side Gemini API execution via Express backend (`/api/gemini/*`); zero client-side key exposure. |
| **Memory & Database** | Cross-user data leaks in database | Strict Firestore Security Rules enforcing user path isolation (`request.auth.uid == userId`). |
| **Inter-System Auth** | Credential theft | Federated Google Identity (Firebase Auth); zero password storage. |

---

## 🔒 Firestore Security Rules

Deploy the following security rules to guarantee strict, owner-bound isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profile isolation
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Interactions subcollection isolation (prompts & Gemini replies)
      match /interactions/{interactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Journal entries subcollection isolation
      match /entries/{entryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## 🚀 Step-by-Step Google Cloud Run Deployment

### 1. Prerequisites & API Activation

Ensure you have the `gcloud` CLI installed and authenticated to your Google Cloud project:

```bash
# Set your active Google Cloud project
gcloud config set project YOUR_PROJECT_ID

# Enable required Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com
```

### 2. Secret Manager Configuration (Zero-Hardcoding)

Store your Gemini API key in Google Cloud Secret Manager:

```bash
# Create and populate the secret in Secret Manager
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant the default Cloud Run service account access to read the secret
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Deploy to Cloud Run

Deploy your containerized service to Google Cloud Run and mount the secret:

```bash
gcloud run deploy gemini-reflection-journal \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --set-env-vars="NODE_ENV=production"
```

### 4. Mandatory Campaign Labeling Verification

Apply the required campaign label for automated challenge verification:

```bash
gcloud run services update gemini-reflection-journal \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 🧪 Verification Walkthrough & Test Guide

1. **Authentication Flow**:
   - Access the root landing page.
   - Click **"Sign in with Google"** / **"Start Journaling with Google"**.
   - Authenticate via Google popup/redirect.
   - Verify redirect to the private dashboard showing user avatar and email.

2. **Reflection & Multi-Turn Conversation**:
   - Select a mode (*Reflect & Unpack*, *Brainstorm & Ideate*, or *Synthesize*).
   - Enter a prompt or select a mindful starter chip.
   - Click Send or press `Cmd/Ctrl + Enter`.
   - Verify Gemini responds with Markdown formatting and model badge.
   - Submit a follow-up response and confirm contextual continuity.

3. **Guaranteed Transaction Persistence**:
   - Click **"Save to Firestore"**.
   - Verify automated synthesis generation and successful save indicator.
   - Switch to **"Past Entries"** tab and confirm entry presence.
   - Search/filter entries by keyword and click on an entry card to view the full multi-turn dialog in the detail modal.
