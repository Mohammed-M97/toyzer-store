# Toyzer Store

[//]: # (Logo)
![Toyzer Store Logo](public/images/logo.png)

## Description

Toyzer Store is an e-commerce website specializing in toys and related products. It provides a platform for users to browse, purchase, and manage their favorite toys. The website is built using React for the frontend and Node.js with Express for the backend, with a MongoDB database.

[//]: # (Home Page Screenshot)
![Home Page Screenshot](path/to/your/homepage_screenshot.png)

[//]: # (Product Detail Page Screenshot)
![Product Detail Page Screenshot](path/to/your/product_detail_screenshot.png)

## Features

*   **Product Catalog:** Browse a wide variety of toys.
*   **User Authentication:** Secure user registration and login.
*   **Shopping Cart:** Add and manage items in a shopping cart.
*   **Checkout Process:** Secure and streamlined checkout process.
*   **Admin Dashboard:** (If applicable) Manage products, users, and orders.
*   **Localization:** Supports multiple languages (English and Arabic).

## Technologies Used

*   **Frontend:**
    *   React
    *   Tailwind CSS
    *   Framer Motion
    *   i18next
    *   Lucide React
*   **Backend:**
    *   Node.js
    *   Express
    *   Mongoose
    *   JSON Web Tokens (JWT)
    *   bcryptjs
    *   Cookie Parser
    *   Cors
    *   Dotenv
    *   Cloudinary
    *   Stripe
    *   UUID
    *   Redis
*   **Database:**
    *   MongoDB

## Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone <https://github.com/Mohammed-M97/toyzer-store>
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd toyzer-store
    ```

3.  **Install dependencies:**

    ```bash
    npm install
    ```

4.  **Configure environment variables:**

    *   Create a `.env` file in both the `frontend` and `backend` directories.
    *   Add the following environment variables to the `.env` files:

        **Backend (.env):**

        ```
        PORT=5000
        MONGO_URI=<your_mongodb_connection_string>
        JWT_SECRET=<your_jwt_secret>
        CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
        CLOUDINARY_API_KEY=<your_cloudinary_api_key>
        CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
        STRIPE_SECRET_KEY=<your_stripe_secret_key>
        STRIPE_PUBLISHABLE_KEY=<your_stripe_publishable_key>
        REDIS_HOST=<your_redis_host>
        REDIS_PORT=<your_redis_port>
        REDIS_PASSWORD=<your_redis_password>
        ```

        **Frontend (.env):**

        ```
        REACT_APP_API_URL=http://localhost:5000
        STRIPE_PUBLISHABLE_KEY=<your_stripe_publishable_key>
        ```

5.  **Start the backend server:**

    ```bash
    cd backend
    npm start
    ```

6.  **Start the frontend development server:**

    ```bash
    cd frontend
    npm run dev
    ```

## Usage

*   **Frontend:** Open your browser and navigate to `http://localhost:3000` (or the port specified in your frontend configuration).
*   **Backend:** The backend server will be running on `http://localhost:5000` (or the port specified in your [.env](http://_vscodecontentref_/0) file).

## Deployment

The project is deployed on Render.

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with descriptive messages.
4.  Push your changes to your fork.
5.  Submit a pull request.

## License

This project is licensed under the MIT License.

## Contact

Mohammed Alawlaqi - [mohammed-alawlaqi@outlook.com]