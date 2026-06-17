# 🚀 AdaSortLab
### Interactive Sorting Algorithm Visualizer powered by **Ada (GNAT)** + **React**

<p align="center">
  <img src="https://img.shields.io/badge/Backend-Ada_GNAT-1E7F3A?style=for-the-badge">
  <img src="https://img.shields.io/badge/Frontend-React_19-61DAFB?style=for-the-badge">
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge">
  <img src="https://img.shields.io/badge/Tailwind-v4-38BDF8?style=for-the-badge">
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge">
</p>

<p align="center">
An educational platform for visualizing, understanding, and benchmarking sorting algorithms with a modern React interface and a high-performance Ada backend.
</p>

---

## ✨ Overview

**AdaSortLab** combines the elegance of modern web technologies with the reliability of the Ada programming language to create an interactive learning environment for algorithms.

The application enables users to:

- 🎞️ Visualize sorting algorithms step-by-step
- ⚡ Compare algorithm performance using real backend execution times
- 📈 Understand time complexities through reference tables
- 🔗 Explore Topological Sorting using interactive DAGs
- 🎨 Experience smooth animations and responsive UI

---

# 📸 Features

## 🎬 Sorting Visualizer
Interactive bar animations with:

- Play / Pause controls
- Adjustable speed
- Custom arrays
- Random dataset generation
- Color-coded comparisons and swaps

### Supported Algorithms

| Algorithm | Average Complexity |
|------------|-------------------|
| Bubble Sort | O(n²) |
| Selection Sort | O(n²) |
| Insertion Sort | O(n²) |
| Quick Sort | O(n log n) |
| Merge Sort | O(n log n) |
| Heap Sort | O(n log n) |

---

## 🔗 Topological Sort Visualizer

Build Directed Acyclic Graphs (DAGs) interactively and watch **Kahn's Algorithm** execute step-by-step.

### Features

- Drag-and-drop nodes
- Edge creation
- Animated traversal
- Queue visualization
- DAG processing using Ada backend

---

## 📚 Complexity Reference

Educational table containing:

- Best Case Complexity
- Average Case Complexity
- Worst Case Complexity
- Space Complexity
- Stability
- Descriptions and explanations

---

## 📊 Performance Benchmark

Measure actual execution times from the Ada backend.

Includes:

- 📈 Line charts
- 📊 Bar charts
- Multiple dataset sizes
- Algorithm comparison

Powered by **Recharts**.

---

# 🏗 Architecture

```text
SortingAlgorithmVisualizerADA/
│
├── backend/                     Ada REST API
│   ├── src/
│   │   ├── api_server.adb
│   │   ├── bubble_sort.adb
│   │   ├── selection_sort.adb
│   │   ├── insertion_sort.adb
│   │   ├── quick_sort.adb
│   │   ├── merge_sort.adb
│   │   ├── heap_sort.adb
│   │   ├── topological_sort.adb
│   │   └── sort_types.ads
│   │
│   └── backend.gpr
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard
    │   │   ├── Visualizer
    │   │   ├── Topological
    │   │   ├── Complexity
    │   │   └── Performance
    │   │
    │   ├── components/
    │   ├── services/
    │   ├── hooks/
    │   ├── constants/
    │   └── types/
    │
    └── vite.config.ts
```

---

# 🛠 Tech Stack

| Layer | Technology |
|---------|------------|
| Backend | Ada 2012 |
| Build System | GNAT + Alire |
| Networking | GNAT.Sockets |
| Frontend | React 19 |
| Language | TypeScript 6 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Charts | Recharts |
| Routing | React Router DOM v7 |
| Icons | Lucide React |
| Bundler | Vite 8 |

---

# 🚀 Getting Started

## Prerequisites

### Install

- Node.js 18+
- npm
- Alire (Ada package manager)
- GNAT toolchain

---

# 1️⃣ Start Backend

```bash
cd backend
alr build
```

Run:

```bash
./bin/backend
```

Windows:

```powershell
.\bin\backend.exe
```

If dependency downloads fail:

```bash
alr build --retry
```

Backend runs on:

```text
http://localhost:8080
```

---

# 2️⃣ Start Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# 📡 REST API

## Sorting Endpoints

| Method | Endpoint |
|----------|----------|
| POST | `/api/sort/bubble` |
| POST | `/api/sort/selection` |
| POST | `/api/sort/insertion` |
| POST | `/api/sort/quick` |
| POST | `/api/sort/merge` |
| POST | `/api/sort/heap` |

---

## Topological Sort

| Method | Endpoint |
|----------|----------|
| POST | `/api/topological` |

---

## Health Check

| Method | Endpoint |
|----------|----------|
| GET | `/` |

---

# 📥 Request Format

### Sorting

```json
{
  "array": [5,3,8,1,9,2]
}
```

---

### Topological Sort

```json
{
  "nodes": ["A", "B", "C"],
  "edges": [
    {
      "from": "A",
      "to": "B"
    },
    {
      "from": "A",
      "to": "C"
    }
  ]
}
```

---

# 🧠 Algorithms Implemented

## Comparison-Based Sorting

- Bubble Sort
- Selection Sort
- Insertion Sort
- Quick Sort
- Merge Sort
- Heap Sort

## Graph Algorithms

- Topological Sort (Kahn's Algorithm)

---

# 📈 Why Ada?

This project demonstrates how Ada can be used beyond embedded systems and aerospace applications.

Advantages include:

- Strong typing
- Reliability
- Safety
- Efficient compiled performance
- Excellent support for systems programming

The backend intentionally avoids external web frameworks and uses **GNAT.Sockets** to implement a lightweight REST server.

---

# 🎓 Educational Objectives

This mini-project showcases:

- Data Structures and Algorithms
- Complexity Analysis
- REST API Design
- Socket Programming in Ada
- Modern React Development
- Graph Algorithms
- Interactive Data Visualization

---

# 🌟 Future Enhancements

- [ ] Radix Sort
- [ ] Counting Sort
- [ ] Shell Sort
- [ ] AVL Tree Visualization
- [ ] Dijkstra's Algorithm
- [ ] Dark/Light theme persistence
- [ ] Export benchmark results
- [ ] Algorithm comparison mode

---

# 🤝 Contributing

Contributions, issues, and feature requests are welcome!

```bash
Fork → Clone → Create Branch → Commit → Push → Pull Request
```

---

# 📜 License

This project is intended for educational purposes.

---

<p align="center">
Built with ❤️ using Ada, React, TypeScript and Vite
</p>
