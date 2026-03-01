# Byway - E-Learning Platform

Byway is a comprehensive, full-stack e-learning platform built with a React frontend and a Django backend. It provides dedicated portals and features for Students, Instructors, and Administrators, covering the entire lifecycle of online education—from course creation and enrollment to learning, grading, and certification.

## Features

### 🎓 For Students

- **Course Discovery:** Browse all courses, filter by categories, and view detailed course information and instructor profiles.
- **Enrollment & Purchasing:** Add courses to cart, manage wishlist, and secure checkout (integrated with Razorpay).
- **Learning Experience:** Dedicated student course player for video and PDF content, progress tracking, and access to "My Learning" dashboard.
- **Assignments & Grading:** Submit assignments and view grades.
- **Certificates:** View and manage earned certificates upon course completion.
- **Community & Interaction:** Participate in community discussions and utilize the built-in chat functionality.
- **Profile Management:** Manage public profile, update personal information, and change passwords securely.

### 👨‍🏫 For Instructors

- **Course Creation & Management:** Create new courses, upload materials (videos, documents), and edit course curriculum.
- **Instructor Dashboard:** Monitor enrollments, course performance, and earnings.
- **Grading & Assignments:** Review student assignment submissions and provide grades.
- **Public Profile:** Showcase expertise, bio, and a portfolio of published courses.

### 🛡️ For Administrators

- **Admin Dashboard:** Platform-wide analytics and overview.
- **Course Moderation:** View and manage all courses on the platform.
- **Instructor Onboarding:** Review, approve, or reject "Become an Instructor" requests.
- **Support & Reports:** Handle user reports, manage support tickets, and resolve platform issues.

### 🔐 Authentication & Security

- Secure Login and Signup flows.
- Email Verification via OTP.
- Forgot and Reset Password functionality.

## Tech Stack

### Frontend

- **Framework:** React 19 / React Router v7
- **Styling & UI:** Tailwind CSS, Styled Components
- **Animations:** Framer Motion, GSAP
- **State & HTTP:** Context API, Axios
- **Media & PDFs:** React Player, React PDF Viewer, PDF.js
- **Other Tools:** SweetAlert2, React Toastify, React Multi Carousel

### Backend

- **Framework:** Django / Django REST Framework (DRF)
- **Payments:** Razorpay Integration
- **Email:** Django SMTP Email Backend (for OTPs and notifications)

## Prerequisites

To run this project locally, ensure you have the following installed:

- Node.js (v18 or higher recommended)
- npm or yarn
- Python (v3.9 or higher recommended)
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd byway
```

### 2. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Activate the virtual environment (if using the existing `venv` folder):
    - **Windows:** `.\venv\Scripts\activate`
    - **macOS/Linux:** `source venv/bin/activate`
3.  Install dependencies (if setting up fresh):
    ```bash
    pip install -r requirements.txt
    ```
4.  Set up environment variables. Create a `.env` file in the backend root and configure your database, email credentials, and Razorpay keys (e.g., `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `EMAIL_HOST_PASSWORD`, etc.).
5.  Apply database migrations:
    ```bash
    python src/byway/manage.py migrate
    ```
6.  Start the Django development server:
    ```bash
    python src/byway/manage.py runserver
    ```
    The backend API should now be running at `http://localhost:8000/`.

### 3. Frontend Setup

1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install NPM packages:
    ```bash
    npm install
    ```
3.  Set up environment variables. Create a `.env` file in the `frontend` directory to store your frontend configurations (like the backend API URL).
4.  Start the React development server:
    ```bash
    npm start
    ```
    The frontend application should now be running at `http://localhost:3000/`.

## Deployment

To deploy this project to a public repository (e.g., GitHub, GitLab):

1.  Initialize a Git repository (if not already done):
    ```bash
    git init
    ```
2.  Ensure you have a `.gitignore` file in the root directory that ignores sensitive files (e.g., `.env`, `node_modules`, `venv`, `__pycache__`, `db.sqlite3`).
3.  Stage and commit your changes:
    ```bash
    git add .
    git commit -m "Initial commit: Byway E-Learning Platform"
    ```
4.  Add your remote repository origin:
    ```bash
    git remote add origin <your-remote-repo-url>
    ```
5.  Push to the `main` or `master` branch:
    ```bash
    git push -u origin main
    ```

**Important Security Note:** Never commit your `.env` files or sensitive credentials (API keys, passwords) to a public repository.


