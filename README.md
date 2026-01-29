# 📸 Pojok Foto

**Pojok Foto** is a modern, web-based photo booth application built with a distinctive **Neobrutalist** design aesthetic. It allows users to capture moments, choose creative layouts, apply filters, and customize their photos with frames—all directly in the browser.

![Pojok Foto Preview](frontend/public/preview-porto.png)

## ✨ Key Features

- **📸 Real-time Camera Capture**: Zero-latency webcam integration.
- **🎨 Creative Layouts**: Various photo grid layouts (Strip, 2x2, etc.).
- **🖼️ Powerful Editor**:
  - **Filters**: Grayscale, Sepia, Retro, and more.
  - **Frames**: Custom Neobrutalist frame overlays.
  - **Slot Management**: Upload specific photos to specific slots or delete them individually.
- **💾 Gallery System**:
  - Save projects to specific albums.
  - View layout history.
- **🛠️ Neobrutalist UI**: Bold borders, high contrast, and raw aesthetic using Tailwind CSS.
- **📱 Responsive**: Optimized for Desktop and Mobile web.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI (Customized)
- **Icons**: Lucide React
- **State**: React Hooks & Context

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Storage**: Local filesystem (uploads)

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/jmahiswara/pojok-foto.git
cd pojok-foto
```

### 2. Backend Setup
The backend handles database connections and file storage.

1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up Environment Variables:
    Create a `.env` file in `backend/` and add:
    ```env
    PORT=5000
    DATABASE_URL="postgresql://user:password@localhost:5432/pojokfoto_db?schema=public"
    JWT_SECRET="your_super_secret_key"
    ```

4.  Run Database Migrations & Seed:
    ```bash
    npx prisma migrate dev --name init
    npx prisma db seed
    ```

5.  Start the Server:
    ```bash
    npm run dev
    ```
    *Server will start on `http://localhost:5000`*

### 3. Frontend Setup
The frontend is the Next.js application.

1.  Open a new terminal and navigate to the frontend folder:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up Environment Variables:
    Create a `.env.local` file in `frontend/` and add:
    ```env
    NEXT_PUBLIC_API_URL="http://localhost:5000"
    ```

4.  Start the Application:
    ```bash
    npm run dev
    ```

5.  Open your browser and visit:
    ```
    http://localhost:3000
    ```

## 🗺️ Project Structure

```
pojok-foto/
├── backend/          # Express.js API & Prisma
│   ├── prisma/      # Database Schema & Seeds
│   ├── src/         # Controllers, Routes, Middleware
│   └── uploads/     # User uploaded images
├── frontend/         # Next.js Application
│   ├── src/
│   │   ├── app/     # Pages (Camera, Editor, Gallery)
│   │   ├── components/ # Shared UI & Layouts
│   │   └── lib/     # Utils & API helpers
└── README.md         # Documentation
```

## 🤝 Contributing
Contributions are welcome! Please check the `implementation_plan.md` for current roadmap items.

## 📄 License
MIT License.
