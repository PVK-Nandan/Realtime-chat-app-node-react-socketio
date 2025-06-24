# 📦 Project Requirements – Real-Time Chat App

This document lists all dependencies, versions, and tools required to run this project locally or in production.  
The project is divided into two main sections: **Backend** and **Frontend**.

---

## ✅ Backend Requirements (Node.js + Express)

### 📁 Folder: `/backend`

### 🧰 Prerequisites:
- Node.js (v16+ recommended)
- npm (comes with Node)

### 📦 Dependencies:

| Package       | Purpose                                 |
|---------------|------------------------------------------|
| express       | Web server framework                    |
| socket.io     | WebSocket-based real-time communication |
| cors          | Enable CORS for frontend-backend connection |

### 📜 Install Instructions:

```bash
cd backend
npm install
```

This installs all dependencies listed in `backend/package.json`.

---

## ✅ Frontend Requirements (React + Socket.IO Client)

### 📁 Folder: `/frontend`

### 🧰 Prerequisites:
- Node.js (v16+)
- npm

### 📦 Dependencies:

| Package             | Purpose                             |
|---------------------|--------------------------------------|
| react               | Core frontend library               |
| react-dom           | DOM bindings for React              |
| socket.io-client    | WebSocket client to talk to backend |

### 📜 Install Instructions:

```bash
cd frontend
npm install
```

This installs all dependencies listed in `frontend/package.json`.

---

## 🧾 Additional Notes

- You do **not** need to upload `node_modules/` to GitHub.  
  Make sure both folders have a `.gitignore` like:

```
node_modules/
.env
```

- Dependencies are automatically managed using `package.json`.  
  Anyone who clones the repo can run `npm install` to restore everything.

---

## 🛠 Tools Used

- [VS Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/) – optional for testing APIs
- [GitHub](https://github.com/) – for version control
- [Render](https://render.com/) – backend deployment
- [Vercel](https://vercel.com/) – frontend deployment

---

## 🌐 Deployment Compatibility

The project is tested and works with:

| Service   | Role       | Status   |
|-----------|------------|----------|
| Vercel    | Frontend   | ✅ Works |
| Render    | Backend    | ✅ Works |

---

## 🧠 Recommended Improvements (Future)

- Add environment variables via `.env`
- Use MongoDB/PostgreSQL for chat message storage
- Add authentication (JWT, OAuth)
- Add Docker support for containerization

---
