# Live Chat

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

**Live Chat** is a real-time messaging application built with **React** and **Firebase Firestore**.  
It allows users to create accounts, engage in 1-on-1 or group conversations, share images, and receive live updates instantly — all powered by a serverless backend.  

This project was developed as a way to explore **modern full-stack development** using a **Next.js frontend** with a **Firebase backend**.  

---

## ✨ Features
- 🔐 **User Authentication** — Sign up, log in, and manage profiles with Firebase Auth.  
- 💬 **Real-Time Messaging** — Send and receive messages instantly with Firestore’s realtime listeners.  
- 🖼 **Image Sharing** — Upload and display images via Firebase Storage.  
- 👥 **Group & Private Chats** — Start conversations with individuals or groups.  
- 🎨 **Modern UI** — Styled with Tailwind CSS and enhanced with motion animations.

---

## 📄 Pages
| Path        | Description            |
|-------------|------------------------|
| `/`         | About page             |
| `/chat`     | Chat interface         |
| `/login`    | Login form             |
| `/signup`   | Sign-up form           |
| `/yourinfo` | Profile setup page     |

---

## 🚀 Live Demo
**Hosted on Firebase:** [Live Chat App](https://livechat-83a0f.firebaseapp.com)  

![Screenshot 1](https://github.com/user-attachments/assets/74fb81c4-5497-43d1-9e96-f759c10f43e8)  
![Screenshot 2](https://github.com/user-attachments/assets/10778f75-e984-4296-9090-e94ecd5842b9)

---

## 🛠 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone <repository-url>
```

2️⃣ Install Dependencies

```bash
cd frontend
npm install
```

3️⃣ Configure Firebase

    Add your Firebase configuration in src/firebase.js.

    Obtain the .env file from the project owner and place it in the root directory.

4️⃣ Run the Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000.

## 📚 Learning Outcomes

Through this project, I gained experience with:
- Building responsive, real-time applications with a serverless backend.
- Implementing authentication and secure data handling with Firebase Auth.
- Handling file uploads and retrieval with Firebase Storage.
- Designing smooth, modern UIs with Tailwind and animation libraries.
