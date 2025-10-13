Of course, here is the complete documentation for the Repecards project.

---

# Repecards Documentation

Welcome to the official documentation for Repecards, a language-learning app designed to help users memorize new words efficiently through spaced repetition.

## 1. Project Overview

Repecards is a mobile application built with a React Native frontend and a Node.js backend. It leverages the principles of the Ebbinghaus Forgetting Curve to create an adaptive learning experience.

### 1.1. Core Concepts

* **Spaced Repetition System (SRS):** Words are reviewed at increasing intervals, just before the user is likely to forget them. This strengthens memory retention over time. The SRS algorithm is implemented in `backend/api/srs.ts`.
* **Adaptive Learning:** The difficulty of challenges adapts to the user's knowledge level. Early stages involve multiple-choice questions with images, while later stages require the user to type the translation.
* **Card Packs (Decks):** Words are grouped by themes (e.g., "Animals and Fruits") into card packs, referred to as "Decks" in the codebase.

### 1.2. Tech Stack

* **Frontend:** React Native (with Expo)
* **Backend:** Node.js with Express
* **Database:** MongoDB with Mongoose
* **Authentication:** Google OAuth 2.0 and JWT

---

## 2. Getting Started

### 2.1. Prerequisites

* Node.js and npm
* Expo CLI
* MongoDB instance

### 2.2. Backend Setup

1.  Navigate to the `backend` directory.
2.  Install dependencies: `npm install`
3.  Create a `.env` file and configure the following variables:
    * `DATABASE_URL`: Your MongoDB connection string.
    * `GOOGLE_CLIENT_ID`: Your Google OAuth client ID.
    * `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret.
    * `JWT_SECRET`: A secret key for signing JWTs.
    * `API_URL`: The public URL of your backend (e.g., `http://localhost:8000`).
4.  Start the development server: `npm run dev`

### 2.3. Frontend Setup

1.  Navigate to the `frontend` directory.
2.  Install dependencies: `npm install`
3.  Create a `.env` file and add: `EXPO_PUBLIC_API_URL=http://localhost:8000` (or your backend URL).
4.  Start the development server: `npx expo start`

---

## 3. Backend Documentation

The backend is a Node.js application using the Express framework to provide a RESTful API.

### 3.1. Database Schema

The database uses Mongoose to model the application's data. The schemas are defined in `backend/api/db/schema.ts`.

* **User:** Represents an application user. Stores their name, Google profile information, and selected language.
* **Card:** A single flashcard with a prompt, answer, and optional image URL.
* **Deck:** A collection of cards, representing a card pack.
* **UserCardProgress:** Tracks a user's progress for a specific card, including SRS data like `easeFactor`, `interval`, `repetitions`, and `nextReviewAt`.

### 3.2. API Endpoints

All endpoints are prefixed with the base URL. Authentication is required for all endpoints except `/auth`.

#### Authentication (`/auth`)

* **`GET /google`**: Initiates the Google OAuth 2.0 authentication flow.
* **`GET /google/callback`**: The callback URL for Google OAuth. On success, it creates or updates the user, generates a JWT, and redirects to the frontend.

#### Users (`/users`)

* **`GET /me`**: Returns the currently authenticated user's profile.
* **`POST /language`**: Sets the user's selected learning language.
* **`POST /decks/:deckId`**: Adds a deck and its cards to the user's learning list.
* **`GET /stats`**: Retrieves the user's learning statistics (total, mastered, and learning words).

#### Decks (`/decks`)

* **`GET /`**: Fetches all available decks, including the count of cards in each.
* **`GET /:id`**: Retrieves a specific deck with its populated cards.

#### Review (`/review`)

* **`GET /session/general`**: Creates a general review session with a mix of due, learning, and new cards.
* **`GET /deck/:deckId`**: Creates a review session for a specific deck.
* **`POST /`**: Submits the result of a review for a single card, updating the user's progress using the SRS algorithm.

---

## 4. Frontend Documentation

The frontend is a React Native application built with Expo. It uses file-based routing provided by Expo Router.

### 4.1. Folder Structure

* **`app/`**: Contains all the screens and routes of the application.
    * `(tabs)`: Defines the layout for the main tab navigator (Learn and Profile).
    * `auth`: Screens related to authentication, such as sign-in and language selection.
    * `review`: The review session screen and its components.tsx].
* **`assets/`**: Static assets like images and fonts.
* **`components/`**: Reusable UI components used across the application.
* **`constants/`**: Theme-related constants, such as colors and fonts.
* **`hooks/`**: Custom React hooks, for example, `useThemeColor` for adapting to light and dark modes.
* **`services/`**: Modules for handling API requests, authentication, and internationalization (i18n).
* **`translations/`**: JSON files containing translations for different languages (en and pt-BR).

### 4.2. Authentication Flow

Authentication is handled via Google OAuth 2.0. The `useAuth` hook provides the authentication state to the application. A protected route mechanism in `app/_layout.tsx` redirects unauthenticated users to the sign-in screen.

1.  The user presses the "Continue with Google" button on the sign-in screen.
2.  `loginWithGoogle` function in `services/auth.ts` opens a web browser for the Google login.
3.  After successful authentication, the backend redirects to the `auth/callback` route with a JWT in the URL parameters.
4.  The `AuthCallback` component saves the token and redirects the user to the main app flow.

### 4.3. Key Components

* **`LanguageSelector`**: A button for selecting a language, displaying the language name and a flag.
* **`FlipCard`**: A component for creating a card that can be flipped, used in the review screen.
* **Review Screen Components (`app/review/components/`)**: The review screen is broken down into smaller, reusable components:
    * `QuestionDisplay`: Shows the front of the card (the question).
    * `FeedbackDisplay`: Shows the back of the card (the correct answer).
    * `AnswerOptions`: Renders multiple-choice options.
    * `AnswerInput`: A text input for typed answers.
    * `ReviewFooter`: The footer containing the "Check" and "Next" buttons.

---

## 5. Code Quality and Refactoring

The project has undergone several refactorings to improve code quality and address identified "code smells."

### 5.1. Identified Code Smells

* **Duplicated Code:** Logic for creating review sessions was duplicated across two different routes in `backend/api/routes/review.ts`.
* **Long Method:** The `GET /session/general` route contained a large, complex block of code responsible for fetching and prioritizing cards from multiple sources.
* **Large Component:** The main review screen component (`frontend/app/review/[deckId].tsx`) managed too many responsibilities, including state management, animations, and rendering logic for various question types.

### 5.2. Applied Refactorings

* **Extract Function:** The duplicated logic for building session questions was extracted into a shared `buildSessionQuestions` function.
* **Extract Method:** The long method in the general review session route was broken down into smaller, more descriptive functions (`getDueCards`, `getLearningCards`, `getNewCards`).
* **Extract Component:** The large review screen component was decomposed into smaller, focused components, each responsible for a specific part of the UI.

These refactorings have resulted in a more modular, maintainable, and readable codebase.