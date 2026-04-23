# Score4Good — Play. Win. Do Good.

## Overview

Score4Good is a modern web application that combines performance tracking, reward-based draws, and charitable contributions.

Users can:
- Enter their latest performance scores
- Participate in simulated draw events
- Select a charity to support

This project was built as a functional MVP based on a provided PRD, focusing on correct system logic, usability, and clean design within a limited timeframe.

---

## 🚀 Tech Stack

- **Framework:** Next.js (React + TypeScript)
- **Styling:** Tailwind CSS (v4)
- **Database & Auth:** Firebase (Authentication + Firestore)
- **Deployment:** Vercel

---

## ✨ Features

### 👤 Authentication
- Secure user signup and login
- Role-based routing (User → Dashboard, Admin → Admin Panel)
- Route protection for both user and admin views

---

### ⛳ Score Management
- Add, edit, and delete performance scores
- Maximum of 5 scores per user
- Automatic replacement of the oldest score when limit is exceeded
- Duplicate date prevention
- Scores displayed in reverse chronological order

---

### 🎲 Draw System
- Simulated monthly draw
- Random number generation
- Matching logic against user scores
- Result feedback showing number of matches

---

###  Charity Selection
- Users can select a preferred charity
- Selection is persisted per user
- Reflects contribution intent within the platform

---

### 📊 User Dashboard
- Subscription status (simulated)
- Score history and management
- Draw simulation interaction
- Charity selection interface

---

### 🛠️ Admin Panel
- View all registered users
- Inspect user scores and selected charities
- Run a global draw simulation across all users
- View draw results and matched users

---

### ⚡ UX Enhancements
- Toast notifications for actions
- Input validation and error handling
- Loading states and disabled interactions
- Clean, responsive UI

---

## 🧠 Key Design Decisions

- Implemented a rolling 5-score system with automatic replacement of the oldest score
- Used manual draw simulation instead of scheduled jobs to demonstrate core functionality
- Simplified subscription system as a mocked state to focus on core features
- Prioritized usability and clarity over unnecessary backend complexity

---

## ⚠️ Limitations (MVP Scope)

- Subscription and payment system is simulated
- Draw system is manually triggered instead of automated monthly execution
- Charity contributions are conceptual and not processed as real transactions

---

## 🌐 Live Demo

- Website: https://your-app.vercel.app
- Dashboard: https://your-app.vercel.app/dashboard
- Admin Panel: https://your-app.vercel.app/admin

---

## 🔑 Test Credentials

### User
Email: testpass@gmail.com  
Password: testpass

### Admin
Email: admin@score4good.com  
Password: testpass

---

## 🛠️ Getting Started

Install dependencies:

```bash
npm install
```

## 📌 Note

This project was built as part of a time-constrained assignment based on a provided PRD, focusing on delivering a working MVP with correct system logic and a polished user experience.