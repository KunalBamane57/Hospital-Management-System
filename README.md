# 🏥 MediCore - Hospital Management System

A modern, full-stack Hospital Appointment Booking and Management System built with Next.js 15, TypeScript, Tailwind CSS, and MongoDB.

## ✨ Features

- **🔐 Role-Based Authentication:** Secure login for both Patients and Doctors using NextAuth.js (Auth.js) and bcrypt password hashing.
- **👨‍⚕️ Doctor Dashboard:** Doctors can manage their schedule, view upcoming appointments, write prescriptions, and review patient medical history.
- **🤕 Patient Dashboard:** Patients can browse doctors by specialization, book appointments, view their upcoming/past visits, and manage their health profiles.
- **⭐ Ratings & Reviews:** Patients can leave star ratings and reviews for doctors after completing an appointment.
- **🤖 AI Health Assistant:** A floating chatbot powered by Google Gemini that answers general health questions 24/7.
- **👨‍💼 Admin Dashboard:** A secure admin portal featuring interactive Recharts for hospital KPIs (revenue, appointments, growth) and full user management capabilities (change roles, deactivate, cascade delete).
- **📊 Real-Time Database:** Fully integrated with MongoDB Atlas using Mongoose for strict schema validation.
- **🎨 Premium UI/UX:** Built with shadcn/ui and Tailwind CSS featuring modern aesthetics, glassmorphism, and responsive design.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Database:** MongoDB Atlas & Mongoose
- **Authentication:** NextAuth.js (Auth.js v5)
- **Styling:** Tailwind CSS & shadcn/ui
- **State Management:** Zustand
- **Form Validation:** Zod
- **Data Visualization:** Recharts

## 🚀 Getting Started

### 1. Clone the repository and install dependencies
```bash
npm install
```

### 2. Set up Environment Variables
Create a `.env.local` file in the root directory and add the following:

```env
# MongoDB Atlas Connection String
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/hospital-db"

# NextAuth Secret (Generate a random string)
NEXTAUTH_SECRET="your-super-secret-random-string"

# NextAuth URL
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Gemini AI API Key (Get from https://aistudio.google.com/apikey)
GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Seed the Database
Before running the application, you need to populate the database with initial counters, doctors, and sample appointments. Run the seed scripts:

```bash
npx tsx src/scripts/seed.ts
npx tsx src/scripts/seed-admin.ts
```

### 4. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 🔑 Default Test Accounts

After running the seed script, you can use the following default credentials to log in and test the application:

### Patient Account
- **Email:** `john@example.com`
- **Password:** `password123`

### Doctor Account
- **Email:** `sarah.chen@medicore.com`
- **Password:** `password123`

### Admin Account
- **Email:** `admin@medicore.com`
- **Password:** `admin123`


## 📄 License
This project is open-source and available under the MIT License.
