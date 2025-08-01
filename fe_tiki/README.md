# TIKI E-commerce Frontend (`fe_tiki`)

This directory contains the frontend application for the TIKI E-commerce project, built with React.js, Vite, and styled with Tailwind CSS.

## Features

-   **Authentication:** User login and registration forms.
-   **Product Catalog:** Homepage, category/brand listings, detailed product pages.
-   **Shopping Experience:** Interactive shopping cart, checkout flow, order history.
-   **User Profile:** Manage personal information.
-   **Admin Panel:** Sections for managing products, brands, categories, and orders.
-   **AI Chatbox:** Integrated with Google Gemini API for interactive support.

## Technologies Used

-   **Framework:** React.js
-   **Build Tool:** Vite
-   **Styling:** Tailwind CSS, PostCSS, Autoprefixer
-   **Data Fetching/State Management:** `@tanstack/react-query`, React Context API
-   **Routing:** `react-router-dom`
-   **Icons:** `@fortawesome/react-fontawesome` (and related packages)
-   **Notifications:** `react-toastify`
-   **API Client:** `axios`

## Setup and Installation

To run the frontend locally, follow these steps:

1.  **Navigate to the frontend directory:**

    ```bash
    cd fe_tiki
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Configure Environment Variables:**

    Create a `.env` file in the `fe_tiki` directory with the following variables:

    ```
    VITE_BACKEND_URL=http://localhost:3000 # URL of your running backend API
    VITE_GEMINI_API_KEY=your_gemini_api_key # Your Google Gemini API Key for the Chatbox
    ```

4.  **Start the development server:**

    ```bash
    pnpm dev
    ```

    The frontend application will typically be accessible at `http://localhost:5173`.

## AI Chatbox Integration

This project includes an AI Chatbox component that leverages the Google Gemini API to provide interactive support.

### Configuration

To enable the Chatbox functionality, ensure you have set the `VITE_GEMINI_API_KEY` in your `.env` file as described in the setup section.

### Usage

The `Chatbox` component is integrated into the main application layout (`App.jsx`) and will be visible across all pages. Users can interact with the chatbot for inquiries, information retrieval, or general assistance.