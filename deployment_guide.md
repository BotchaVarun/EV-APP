# Deployment Guide for Hiring Hub

This application is configured for deployment on **Vercel** with a **Firebase** backend.

## Prerequisites

1.  **Vercel Account**: [Sign up here](https://vercel.com/signup).
2.  **Firebase Project**: Ensure you have a Firestore database and Authentication enabled.

## Option 1: Deploy using Git (Recommended)

1.  **Push your code** to a Git repository (GitHub, GitLab, or Bitbucket).
2.  **Import Project** in Vercel:
    *   Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click "Add New... > Project".
    *   Import your repository.
3.  **Configure Project Settings**:
    *   **Framework Preset**: Select `Vite`.
    *   **Root Directory**: Leave as `./`.
    *   **Build & Output Settings**:
        *   **Output Directory**: This is already configured in `vercel.json` as `dist/public`.
    *   **Environment Variables**:
        *   Add `FIREBASE_SERVICE_ACCOUNT`. Value should be the JSON string of your service account key.
        *   **CRITICAL**: Add `VITE_FIREBASE_CONFIG`. Value must be the JSON string of your Firebase client configuration (contains apiKey, authDomain, etc.). You can find this in your local `.env` file or Firebase Console.

4.  **Deploy**: Click "Deploy".
5.  **Post-Deployment**:
    *   One last step! The domain `your-app.vercel.app` is not yet authorized by Firebase.
    *   Go to [Firebase Console](https://console.firebase.google.com/).
    *   Navigate to **Authentication** > **Settings** > **Authorized Domains**.
    *   Click "Add domain" and paste your Vercel URL (without `https://`).

## Option 2: Deploy using Vercel CLI

1.  Install Vercel CLI:
    ```bash
    npm install -g vercel
    ```
2.  Log in:
    ```bash
    vercel login
    ```
3.  Deploy from the project root:
    ```bash
    vercel
    ```
4.  Follow the prompts. When asked about settings:
    *   Link to existing project? [No]
    *   In which directory is your code located? `./`
    *   Want to modify these settings? [Yes]
    *   **Output Directory**: `dist/public`
    *   (Accept defaults for others usually, but verify Build Command is `npm run build`).

## Critical Notes

*   **Database**: The application uses **Firestore**. Ensure your Firebase security rules allow the necessary access.
*   **Authentication**: Ensure Firebase Authentication is enabled.
*   **Environment Variables**: The app will fail to start if `FIREBASE_SERVICE_ACCOUNT` is missing or invalid in the Vercel Project Settings.
