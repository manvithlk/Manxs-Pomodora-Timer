# 🍅 Pomodoro Dashboard

A modern Pomodoro productivity dashboard built with **React, TypeScript, Vite, and Supabase**.

Track focus sessions, manage productivity, and stay organized with a clean and responsive interface.

## ✨ Features

* 🔐 User Authentication with Supabase
* ⏱️ Customizable Pomodoro Timer
* 📊 Session Tracking & Statistics
* 👤 User Profile Management
* ⚙️ Adjustable Timer Settings
* 🔔 Notification Sound Support
* ☁️ Cloud Data Storage with Supabase
* 📱 Responsive Design

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* CSS

### Backend & Database

* Supabase

  * Authentication
  * PostgreSQL Database

### Development Tools

* ESLint
* npm

---

## 📂 Project Structure

```text
src/
├── assets/
├── components/
│   ├── Auth.tsx
│   ├── Contact.tsx
│   ├── Settings.tsx
│   ├── UserHeader.tsx
│   └── UserProfile.tsx
│
├── contexts/
│   ├── AuthContext.tsx
│   └── SessionContext.tsx
│
├── hooks/
│   ├── useAuth.ts
│   └── useTimer.ts
│
├── lib/
│   └── supabase.ts
│
├── App.tsx
├── main.tsx
└── index.css
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/manvithlk/Manxs-Pomodoro-Timer.git
cd pomodoro-dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start development server

```bash
npm run dev
```

### 5. Build for production

```bash
npm run build
```

---

## 📸 Screenshots

Add screenshots of:

* Login Screen
* Dashboard
* Timer
* Settings
* User Profile

---

## 🎯 Future Improvements

* Dark Mode
* Task Management
* Focus Analytics
* Leaderboards
* Calendar Integration
* Mobile App Version

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

Feel free to fork the repository and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Built by Manvith as a productivity and learning project using modern web technologies.
