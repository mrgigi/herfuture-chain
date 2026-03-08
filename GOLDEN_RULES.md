# 🌟 HerFuture Chain: Golden Rules for Content

This document serves as the "Source of Truth" for all student-facing copy and terminology. To empower our 18-24 year old audience, we use language that is encouraging, modern, and relatable, avoiding technical jargon or formal academic terms.

## 1. Core Terminology Map

Always use the **Preferred Term** instead of the **Legacy Term** in any student-facing UI.

| Legacy Term | Preferred Term | Context / Rationale |
| :--- | :--- | :--- |
| **Participant** | **Learner** or **Member** | Avoids sounding like a research subject. |
| **Curriculum** | **Learning Path** | "Curriculum" sounds like a dusty school book. |
| **Module** | **Lesson** | Simple, clear, and school-neutral. |
| **Mastered** | **Unlocked** | Feels like progress and achievement. |
| **Grant** | **Reward** or **Earnings** | "Grant" is technical; "Reward" is positive. |
| **Track** | **Level** | Feels like advancing through an experience. |
| **Verifiable Credentials** | **Digital Awards** | Simple and easy to understand. |
| **Certificates** | **Achievements** | Feels more like a personal win. |

## 2. Tone & Voice Guidelines

*   **Empowering, not clinical**: Use active verbs (e.g., "Start your journey" vs "Course enrollment").
*   **Concise & Direct**: 18-24 year olds prefer scanning. Use short sentences and punchy headers.
*   **Community-Focused**: Use "We" and "You" to create a sense of partnership.
*   **Gaming Infused**: Use progress-related language like "Unlocked", "Level Up", and "Completed" to maintain momentum.

## 3. Global Replacement Rules

*   **Buttons**: Should always be action-oriented (e.g., "Ready to learn?" vs "Start Module").
*   **Empty States**: Should be encouraging (e.g., "Your achievements will appear here!" vs "No certificates found").
*   **Success Messages**: Celebrate the win (e.g., "You just unlocked a reward!" vs "Grant successfully triggered").

---
*Created on 2026-03-08*

---

## 4. Reward & Progress Business Logic

These rules govern how earnings, upcoming rewards, and progress percentages are calculated across the platform.

### 💰 Total Earned
- Calculated as the **sum of `grant_amount`** for every lesson the learner has completed.
- Each lesson sets its own `grant_amount` (e.g., $30, $20). There is **no global flat rate**.
- Source: `lessons.grant_amount` joined to `student_progress` where `status = 'completed'`.

### 🏆 Upcoming Reward
- Displays the `grant_amount` of the **next incomplete lesson** in the learner's path.
- Lessons are prioritised in this strict order:
  1. **Course `track_number`** (lowest track first)
  2. **Module `sequence_number`** (first module in that course)
  3. **Lesson `sequence_number`** (first lesson in that module)
- This ensures the reward shown matches exactly what they'll earn next — not a milestone average.

### 📈 Progress Percentage
- **Hero section**: Shows the percentage of the **currently active learning path** (the first incomplete course).
- **Learning Journey grid**: Each card shows percentage for its own specific course only.
- Formula: `completed lessons in course / total lessons in course × 100`
- Global percentage (all lessons / all courses) is calculated but only used as a fallback.

### 🔒 Grant Disbursement Gate
- Blockchain grant release only fires if `system_settings.grant_disbursement_active = true`.
- Admins can toggle this from the Command Center in the Admin Dashboard.
