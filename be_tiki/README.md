# TIKI E-commerce Backend (`be_tiki`)

This directory houses the robust backend API for the TIKI E-commerce project, meticulously developed with Node.js, Express.js, and PostgreSQL, leveraging the Sequelize ORM.

## Key Highlights

-   **Scalable RESTful API:** Designed to provide a comprehensive and efficient set of endpoints for all e-commerce operations.
-   **Secure Authentication & Authorization:** Implements industry-standard JWT for token-based authentication and Argon2 for secure password hashing, coupled with role-based access control.
-   **Modular & Layered Architecture:** Follows a clear separation of concerns with dedicated layers for controllers, models, middlewares, and DTOs, promoting maintainability and extensibility.
-   **Robust Data Management:** Utilizes Sequelize ORM for seamless interaction with PostgreSQL, including database migrations for schema versioning and data seeding capabilities.
-   **Comprehensive Data Validation:** Integrates Joi for powerful and flexible request payload validation, ensuring data integrity and API reliability.
-   **Efficient File Handling:** Incorporates Multer for streamlined processing of multi-part form data, specifically for image uploads.
-   **Centralized Error Handling:** Employs a global asynchronous error handling middleware (`asyncHandler`) for consistent and graceful error responses.

## Features

-   **User Management:**
    -   API endpoints for secure user registration, login, and comprehensive profile management.
    -   Supports distinct user roles (e.g., Admin, User) with appropriate access controls.
-   **Product Management:**
    -   Full CRUD (Create, Read, Update, Delete) operations for products, categories, and brands.
    -   Advanced product modeling, including support for customizable attributes (e.g., color, size) and complex product variants.
    -   Dedicated endpoints for efficient product image uploads and management.
    -   Provides robust search, filtering, and pagination capabilities for product listings.
-   **Order Management:**
    -   API for managing shopping cart operations (adding, updating, deleting items).
    -   Facilitates the checkout process, leading to order creation.
    -   Enables users to track their order history and current status.
-   **Content Management:**
    -   API for dynamic management of promotional banners.
    -   Endpoints for news and article management, including the ability to link articles to specific products.
-   **Image Handling:**
    -   Supports secure and efficient image uploads to the server.
    -   Serves static image files, providing full URLs for frontend consumption.

## Technologies Used

-   **Runtime:** Node.js (v22.x recommended)
-   **Web Framework:** Express.js
-   **Database:** PostgreSQL
-   **ORM:** Sequelize
-   **Authentication:** `jsonwebtoken` (JWT), `argon2` (Password Hashing)
-   **Data Validation:** `joi`
-   **File Uploads:** `multer`
-   **Environment Variables:** `dotenv`
-   **Cross-Origin Resource Sharing (CORS):** `cors`
-   **Cookie Parsing:** `cookie-parser`

## Setup and Installation

To run the backend locally, please follow these steps:

1.  **Navigate to the backend directory:**

    ```bash
    cd be_tiki
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Configure Database and Environment Variables:**

    Ensure you have a PostgreSQL database server running. Create a `.env` file in the `be_tiki` directory and configure your PostgreSQL database connection details and JWT secret. Replace placeholder values with your actual credentials:

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

4.  **Run Database Migrations:**

    This will create the necessary tables in your PostgreSQL database.
    ```bash
    npx sequelize-cli db:migrate
    ```

5.  **Run Database Seeders (Optional):**

    If you have seed files to populate your database with initial data, run:
    ```bash
    npx sequelize-cli db:seed:all
    ```

6.  **Start the development server:**

    ```bash
    pnpm dev
    ```

    The backend API will be accessible at `http://localhost:3000` (or the `PORT` you configured).

## API Endpoints

For detailed information on available API endpoints, their request/response formats, and authentication requirements, please refer to the source code within the `routes`, `controllers`, and `dtos` directories. Key endpoint categories include:

-   `/api/users` (Authentication, User Profile)
-   `/api/products` (Product Catalog, Search, Details)
-   `/api/categories`
-   `/api/brands`
-   `/api/carts` (Shopping Cart Management)
-   `/api/orders` (Order Creation, History)
-   `/api/banners`
-   `/api/news`
-   `/api/images` (Image Uploads)

## Database Schema

The database schema is defined and managed through Sequelize migrations. Detailed table structures and relationships can be found in the `migrations` and `models` directories.

## Deployment

This backend is designed for cloud deployment as a web service. Refer to the main project `README.md` for comprehensive deployment instructions on platforms like Render.