# AdaSortLab

> **An interactive educational platform for visualizing and comparing sorting algorithms — powered by an Ada (GNAT) REST backend and a React/TypeScript/Vite frontend.**

[![Ada](https://img.shields.io/badge/Backend-Ada%20GNAT-green)](https://www.adacore.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-cyan)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8-purple)](https://vitejs.dev/)

---

## 🎯 Features

| Feature | Description |
|---|---|
| **Sort Visualizer** | Animated bar chart with step-by-step playback, speed control, custom arrays |
| **Topological Sort** | Interactive DAG builder with drag-and-drop nodes, Kahn's algorithm animated |
| **Complexity Table** | Full Big-O reference with educational descriptions |
| **Performance Benchmark** | Real Ada backend timing — bar + line charts via Recharts |

### Algorithms Supported
- Bubble Sort
- Selection Sort
- Insertion Sort
- Quick Sort
- Merge Sort
- Heap Sort
- Topological Sort (Kahn's algorithm on a DAG)

---

## 🏗️ Architecture

```
SortingAlgorithmVisualizerADA/
├── backend/         Ada (GNAT) REST API server
│   ├── src/         Ada source files
│   └── backend.gpr  GPRbuild project file
└── frontend/        React + TypeScript + Vite SPA
    ├── src/
    │   ├── pages/       Dashboard, Visualizer, Topological, Complexity, Performance
    │   ├── components/  Navbar, Layout, SortBars
    │   ├── services/    API client + dataset generator
    │   ├── hooks/       useTheme
    │   ├── constants/   Algorithm metadata, colors
    │   └── types/       TypeScript type definitions
    └── vite.config.ts
```

---

## 🚀 Quick Start

### Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [Alire (Ada package manager)](https://alire.ada.dev/)

### 1. Start Backend (Ada server on port 8080)

```powershell
cd backend
alr build
.\bin\backend.exe
```

> If `alr build` fails due to toolchain download issues, retry with:
> ```powershell
> alr build --retry
> ```

### 2. Start Frontend (Vite dev server on port 5173)

```powershell
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📡 API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/sort/bubble` | Run Bubble Sort |
| `POST` | `/api/sort/selection` | Run Selection Sort |
| `POST` | `/api/sort/insertion` | Run Insertion Sort |
| `POST` | `/api/sort/quick` | Run Quick Sort |
| `POST` | `/api/sort/merge` | Run Merge Sort |
| `POST` | `/api/sort/heap` | Run Heap Sort |
| `POST` | `/api/topological` | Run Topological Sort on a DAG |
| `GET`  | `/` | Health check |

### Request Format (sort endpoints)
```json
{ "array": [5, 3, 8, 1, 9, 2] }
```

### Request Format (topological endpoint)
```json
{
  "nodes": ["A", "B", "C"],
  "edges": [{"from": "A", "to": "B"}, {"from": "A", "to": "C"}]
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Ada 2012, GNAT, GNAT.Sockets, Alire |
| Frontend Framework | React 19, TypeScript 6 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4, Custom CSS Design System |
| Animation | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router DOM v7 |

---

## 📘 University Project Notes

This project was built as a mini-project demonstrating:
- Ada language for systems/backend programming
- REST API design with pure sockets (no external Ada libraries)
- React for modern interactive UIs
- Algorithm visualization and complexity analysis
- Data structure (DAG) visualization with Kahn's topological sort
