# ⚽ Clubit - Frontend Application

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Welcome to the **Clubit** frontend repository! This modern web application is the client-facing platform for the Clubit ecosystem, built with the latest version of **Angular**, leveraging **Standalone Components**, the new **Control Flow**, and **Signals** for reactive state management.

## 🚀 Quick Start (Docker)

The absolute easiest way to get this project running is via our fully containerized Docker setup. This ensures you have the exact same environment as every other developer.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)

### Running the App

1. Ensure your backend and database (`clubit-back`) are already running, as this frontend connects to the shared `clubit_network`.
2. Navigate to this repository's root directory.
3. Run the following command:

```bash
docker compose up -d --build
```

The application will be built and served. You can access it at: **[http://localhost:4200](http://localhost:4200)**

To stop the container, run:
```bash
docker compose down
```

---

## 🛠 Manual Setup (Local Development)

If you prefer running the application outside of Docker for development purposes:

1. Ensure you have **Node.js** (v24.14.0 or higher) installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

---

## 🏗 Architecture & Folder Structure

We follow a strict, scalable, and modular architecture based on `features`. This ensures the application remains maintainable even as it grows massively. We heavily utilize **Standalone Components** removing the need for `NgModules`.

```text
clubit-front/
├── src/
│   ├── app/
│   │   ├── core/          # 🧠 The "Brain" (Singletons)
│   │   │   ├── guards/    # Route protection (AuthGuard)
│   │   │   ├── intercept/ # HTTP Interceptors (JWT Injection)
│   │   │   ├── services/  # Global state/services
│   │   │   └── layout/    # Structural base (Header, Sidebar)
│   │   │
│   │   ├── shared/        # ♻️ Reusable UI Components
│   │   │   ├── components/# Generic Buttons, Modals, Cards
│   │   │   ├── directives/# Custom HTML behavior
│   │   │   ├── pipes/     # Data formatting
│   │   │   └── ui/        # Design System tokens
│   │   │
│   │   ├── features/      # 🚀 Business Logic / Domains (Lazy Loaded)
│   │   │   ├── auth/      # Login, Registration
│   │   │   ├── dashboard/ # Analytics, Financial Dashboard
│   │   │   ├── payments/  # Transaction management
│   │   │   ├── schools/   # Organizations/Clubs
│   │   │   └── students/  # User/Student profiles
│   │   │
│   │   ├── app.component.ts # Root component
│   │   ├── app.config.ts    # Global providers & HttpClient
│   │   └── app.routes.ts    # Main Router (Connects features)
```

## 🎨 Design System & UI

This application's UI is derived from professional AI-driven designs provided via **Google Stitch (Figma)**. The core design principles focus on a clean, responsive, and highly modern athletic aesthetic.

- **Main Views:** `Financial Dashboard`, `Payment Analytics`, `Student Directory`.
- **Styling:** Handled via global SCSS and responsive utility classes.

## 📝 Contribution Guidelines

1. **Branching Strategy:** Use `feature/nombre-de-la-tarea` for new developments and `fix/nombre-del-bug` for bug fixes.
2. **Commits:** We follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Please make small, descriptive, and atomic commits.
3. **Standalone Only:** Please do not create `.module.ts` files. Everything should be an `@Component({ standalone: true })`.

---
*Built with passion for Clubit.* ⚽
