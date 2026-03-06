# 🌸 HerFuture Chain: Master Project Guide

Welcome to the **Source of Truth** for HerFuture Chain. This document explains how all the pieces of our ecosystem fit together.

---

## � The UNICEF Venture Fund Mission
Our goal is to technically prove three core breakthroughs:
1.  **Decentralized Identity:** Participants "own" their profile regardless of the platform.
2.  **On-Chain Verifiable Credentials:** Official certificates minted as permanent, tamper-proof blockchain records.
3.  **Conditional Micro-Grants:** Smart contracts that automatically release funds once a student completes a specific course or quiz.

*And above all... a world-class **UI/UX** that makes high-tech feel like second nature for students.*

---

## �🏗️ 1. The Technology Stack
We use a "Best-in-Class" modular architecture so that each part does what it is best at:

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **The Surface** | React (Vite) | The beautiful UI students interact with. |
| **The Brain** | Supabase | Your "Reception Desk" & "Library"—holds profiles and lesson content. |
| **The Classroom** | Light LMS (Custom) | Our bespoke, mobile-first learning interface built into the React app. |
| **The Vault** | Celo (Blockchain) | Where we mint official, permanent certificates and release grants. |
| **The Engine** | Render | Where our Backend API services live and breathe. |

---

## 📱 2. The Student Identity (Phone Numbers)
We prioritize accessibility. Instead of complex passwords, we use **Phone Numbers**.

### How Registration Works:
1.  **Input:** Student enters their phone number on the React app.
2.  **Verification:**
    *   **Live Mode:** They get a real SMS code.
    *   **Test Mode (Bypass):** Entering `000000` skips the wait.
3.  **Supabase Profile:** A profile is created with their Name, Phone, and a generated Crypto Wallet.

---

## 🎓 3. The Light LMS Flow
Students should never leave the app to learn.
*   **Bite-Sized Content:** Lessons are presented as beautiful cards with videos and short text.
*   **Progress Sync:** Completing a module updates Supabase immediately.
*   **Grant Trigger:** Passing a module quiz automatically triggers a blockchain transaction to release a micro-grant.

---

## 📂 4. Where does the data live?
To keep things clean, we centralize everything in Supabase:
*   **Identity:** Real Name, Phone, DID, Wallet Address.
*   **Library:** Courses, Lessons, Quiz Questions.
*   **Progress:** Accomplishments, Earned Credentials, Grant History.

---

## 🧪 5. Testing & Development
*   **Database Fixes:** If Moodle gets stuck, we use the "Table Prefix Bypass" (changing `mdl_` to `her_`) for a fresh start.
*   **Local UI Dev:** Run `npm run dev` in the frontend folder to see changes live.
*   **Render Deploy:** Pushing code to `main` on GitHub automatically updates the live site.

---

> [!NOTE]
> **Source of Truth Priority:** If you are unsure how a feature should work, check this document first. If it's not here, we'll vibe it out and then add it here!
