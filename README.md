# TIKI E-commerce Application

This is a full-stack e-commerce application inspired by Tiki, with a separate backend (Node.js, Express, PostgreSQL, Sequelize) and frontend (React, Vite, Tailwind CSS).

## Features

- User authentication (signup, login)
- Product listing and details
- Shopping cart functionality
- Order management
- Admin panel (if implemented)

## Technologies Used

### Backend

- Node.js
- Express.js
- PostgreSQL (via Sequelize ORM)
- JWT for authentication
- Argon2 for password hashing
- Multer for file uploads

### Frontend

- React.js
- Vite
- Tailwind CSS
- State management (e.g., Redux, Context API, Zustand - depending on implementation)

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/TIKI.git
    cd TIKI
    ```

2.  **Backend Setup (`be_tiki`):**
    ```bash
    cd be_tiki
    pnpm install
    ```
    Create a `.env` file in the `be_tiki` directory with the following variables:
    ```
    PORT=3000
    DB_HOST=<Your PostgreSQL Host>
    DB_USER=<Your PostgreSQL User>
    DB_PASSWORD=<Your PostgreSQL Password>
    DB_NAME=<Your PostgreSQL Database Name>
    JWT_SECRET=<Your JWT Secret>
    ALLOWED_ORIGINS=http://localhost:5173,https://fe-shopapp.vercel.app # Add your frontend URLs
    ```
    Run database migrations and seeders (if any):
    ```bash
    npx sequelize-cli db:migrate
    npx sequelize-cli db:seed:all
    ```
    Start the backend:
    ```bash
    pnpm dev
    ```

3.  **Frontend Setup (`fe_tiki`):**
    ```bash
    cd ../fe_tiki
    pnpm install
    ```
    Create a `.env` file in the `fe_tiki` directory with the following variables:
    ```
    VITE_BACKEND_URL=http://localhost:3000 # or your deployed backend URL
    ```
    Start the frontend:
    ```bash
    pnpm dev
    ```

## Deployment on Render

This project is configured for deployment on Render as two separate services: one for the backend and one for the frontend.

### Backend Deployment (`be_tiki`)

-   **Build Command:** `pnpm install`
-   **Start Command:** `pnpm start`
-   **Environment Variables:**
    -   `PORT` (optional, Render provides its own)
    -   `DB_HOST`
    -   `DB_USER`
    -   `DB_PASSWORD`
    -   `DB_NAME`
    -   `JWT_SECRET`
    -   `ALLOWED_ORIGINS` (set this to your deployed frontend URL on Render)

### Frontend Deployment (`fe_tiki`)

-   **Build Command:** `pnpm install && pnpm build`
-   **Publish Directory:** `dist`
-   **Environment Variables:**
    -   `VITE_BACKEND_URL` (set this to the URL of your deployed backend service on Render)
