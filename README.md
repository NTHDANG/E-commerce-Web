# TIKI E-commerce Application

This is a comprehensive full-stack e-commerce application inspired by Tiki, meticulously designed with a monorepo structure using pnpm workspaces. It features a robust backend built with Node.js and Express.js, and a dynamic, responsive frontend developed with React.js and Tailwind CSS.

## Project Overview & Key Highlights

-   **Modern Monorepo Architecture:** Efficiently manages both frontend and backend codebases within a single repository, leveraging `pnpm workspaces` for streamlined dependency management and development workflows.
-   **Integrated AI Chatbox:** A cutting-edge feature powered by the Google Gemini API, providing an interactive and intelligent customer support experience.
-   **Comprehensive E-commerce Functionality:** Developed as a complete solution covering user authentication, product catalog management (with advanced attributes and variants), shopping cart, order processing, and an administrative panel.
-   **Robust Technology Stack:** Built with industry-standard and high-performance technologies including React.js, Node.js, Express.js, PostgreSQL, and Sequelize, ensuring scalability and maintainability.
-   **Adherence to Best Practices:** Emphasizes clean code, strong data validation (Joi), secure authentication (JWT, Argon2), efficient data fetching (React Query), and a clear separation of concerns.
-   **Cloud-Ready Deployment:** Configured for seamless deployment on cloud platforms like Render, demonstrating practical deployment experience.

## Project Structure

The project is organized into a monorepo with two primary packages:

-   `be_tiki/`: Contains the backend API services.
-   `fe_tiki/`: Contains the frontend web application.

## Features

### Backend (`be_tiki`)

The backend provides a resilient and scalable RESTful API, supporting all core e-commerce functionalities:

-   **User Management:**
    -   Secure user registration and login with JWT-based authentication and Argon2 for robust password hashing.
    -   Comprehensive user profile management, including personal details and contact information.
    -   Role-based access control with distinct administrative privileges for system management.
-   **Product Management:**
    -   Full CRUD operations for products, categories, and brands, enabling dynamic catalog management.
    -   Advanced product modeling supporting customizable attributes (e.g., color, size) and complex product variants.
    -   Efficient image upload and management system for product visuals.
    -   Sophisticated product search, filtering, and pagination capabilities for enhanced user experience.
-   **Order Management:**
    -   Intuitive shopping cart functionality, allowing users to add, update, and remove items.
    -   Streamlined checkout process for order creation and payment handling.
    -   Detailed order history and real-time status tracking for users.
    -   Administrative tools for comprehensive order oversight and management.
-   **Content Management:**
    -   Dynamic banner management system for promotional content.
    -   News and article management with the ability to link relevant products.
    -   Integrated feedback and review system for product evaluation.
-   **Technical Excellence:**
    -   Rigorous request validation using Joi for data integrity and security.
    -   Utilizes Multer for efficient handling of multi-part form data, specifically for file uploads.
    -   Centralized asynchronous error handling with `asyncHandler` middleware, promoting cleaner and more robust code.
    -   Database schema managed through Sequelize migrations, ensuring version control and easy evolution of the database structure.

### Frontend (`fe_tiki`)

The frontend is a modern, responsive web application designed to deliver an engaging user experience:

-   **Authentication & Authorization:** User-friendly login and registration interfaces, seamlessly integrating with the backend's JWT authentication system.
-   **Dynamic Product Catalog:**
    -   An engaging homepage featuring prominent products and promotional banners.
    -   Dedicated pages for browsing products by category and brand.
    -   Rich product detail pages showcasing images, comprehensive descriptions, technical specifications, and variant selections.
    -   Integrated search functionality for quick product discovery.
-   **Seamless Shopping Experience:**
    -   An interactive shopping cart allowing users to easily manage quantities and items.
    -   A smooth and guided checkout flow.
    -   Accessible order history and status updates for all placed orders.
-   **Personalized User Profile:**
    -   A dedicated section for users to view and update their personal information, including name, phone number, and address.
-   **Intuitive Admin Panel:**
    -   A secure, dedicated administrative interface for managing products, brands, categories, and orders, accessible to authorized users.
-   **Modern UI/UX:**
    -   Visually appealing and responsive design implemented with Tailwind CSS, reflecting the aesthetic of a professional e-commerce platform.
-   **Advanced State Management:** Leverages `@tanstack/react-query` for efficient data fetching, caching, and synchronization, significantly improving application performance and user experience. Utilizes React Context API for global state management.
-   **Declarative Routing:** Implemented with `react-router-dom` for intuitive and efficient navigation within the single-page application.
-   **Rich Iconography:** Integrated FontAwesome for a comprehensive set of scalable vector icons, enhancing visual appeal and usability.
-   **Quality Assurance:** Includes unit tests (e.g., `Chatbox.test.jsx`) for critical components, ensuring reliability and maintainability of the codebase.

## Technologies Used

### Backend

-   **Runtime Environment:** Node.js (v22.x recommended)
-   **Web Framework:** Express.js
-   **Database:** PostgreSQL
-   **Object-Relational Mapper (ORM):** Sequelize
-   **Authentication:** `jsonwebtoken` (JWT), `argon2` (Password Hashing)
-   **Data Validation:** `joi`
-   **File Uploads:** `multer`
-   **Environment Variables:** `dotenv`
-   **Cross-Origin Resource Sharing (CORS):** `cors`
-   **Cookie Parsing:** `cookie-parser`

### Frontend

-   **JavaScript Library:** React.js
-   **Build Tool:** Vite
-   **CSS Framework:** Tailwind CSS
-   **CSS Post-processing:** PostCSS, Autoprefixer
-   **Data Fetching & State Management:** `@tanstack/react-query`, React Context API
-   **Routing:** `react-router-dom`
-   **Icon Library:** `@fortawesome/react-fontawesome`, `@fortawesome/free-brands-svg-icons`, `@fortawesome/free-solid-svg-icons`, `@fortawesome/free-regular-svg-icons`
-   **Notifications:** `react-toastify`
-   **HTTP Client:** `axios`

## Setup and Installation

To get the project up and running on your local machine, please follow these detailed steps:

1.  **Prerequisites:**
    -   Node.js (v22.x or later is highly recommended)
    -   pnpm (a fast, disk space efficient package manager, essential for monorepos)
    -   A running PostgreSQL database server instance.

2.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/TIKI.git
    cd TIKI
    ```

3.  **Install pnpm dependencies for the monorepo:**

    This command will install all dependencies for both `be_tiki` and `fe_tiki` packages.
    ```bash
    pnpm install
    ```

4.  **Backend Setup (`be_tiki`):**

    Navigate into the backend directory:
    ```bash
    cd be_tiki
    ```

    Create a `.env` file in the `be_tiki` directory and configure your PostgreSQL database connection details and JWT secret. Replace placeholder values with your actual credentials:
    ```
    PORT=3000
    DB_HOST=localhost
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_NAME=your_db_name
    JWT_SECRET=your_strong_random_jwt_secret_key_at_least_32_chars
    JWT_EXPIRATION=1d # e.g., 1h, 7d, 24h
    ALLOWED_ORIGINS=http://localhost:5173,https://fe-shopapp.vercel.app # Comma-separated list of allowed frontend origins
    ```
    **Note:** If your PostgreSQL is running in a Docker container or a remote server, ensure `DB_HOST` is set accordingly.

    Run database migrations to create the necessary tables in your PostgreSQL database:
    ```bash
    npx sequelize-cli db:migrate
    ```
    (Optional) Populate your database with initial data by running seeders:
    ```bash
    npx sequelize-cli db:seed:all
    ```

    Start the backend development server:
    ```bash
    pnpm dev
    ```
    The backend API will be accessible at `http://localhost:3000` (or the `PORT` you configured).

5.  **Frontend Setup (`fe_tiki`):**

    Navigate back to the project root and then into the frontend directory:
    ```bash
    cd ../fe_tiki
    ```

    Create a `.env` file in the `fe_tiki` directory and specify the URL of your running backend API and your Google Gemini API Key:
    ```
    VITE_BACKEND_URL=http://localhost:3000 # Or your deployed backend URL
    VITE_GEMINI_API_KEY=your_google_gemini_api_key # Obtain from Google AI Studio
    ```

    Start the frontend development server:
    ```bash
    pnpm dev
    ```
    The frontend application will typically be accessible at `http://localhost:5173`.

## Deployment on Render

This project is structured for easy deployment on cloud platforms like Render, with separate services for the backend and frontend.

### Backend Deployment (`be_tiki`)

-   **Service Type:** Web Service
-   **Build Command:** `pnpm install`
-   **Start Command:** `pnpm start`
-   **Environment Variables:** Configure these variables on Render to match your production database and JWT settings. Ensure `ALLOWED_ORIGINS` includes your deployed frontend URL.
    -   `PORT`
    -   `DB_HOST`
    -   `DB_USER`
    -   `DB_PASSWORD`
    -   `DB_NAME`
    -   `JWT_SECRET`
    -   `JWT_EXPIRATION`
    -   `ALLOWED_ORIGINS`

### Frontend Deployment (`fe_tiki`)

-   **Service Type:** Static Site (or Web Service if SSR/SSG is required)
-   **Build Command:** `pnpm install && pnpm build`
-   **Publish Directory:** `dist`
-   **Environment Variables:**
    -   `VITE_BACKEND_URL`: Set this to the public URL of your deployed backend service on Render.
    -   `VITE_GEMINI_API_KEY`: Your Google Gemini API Key.

## Contributing

Contributions are welcome! Please feel free to fork the repository, create feature branches, and submit pull requests.

## License

This project is licensed under the ISC License.
