# Foot Over Bridge System

A full-stack web application designed to manage and monitor Foot Over Bridge systems with a user-friendly interface, secure authentication, and real-time data handling.

---

## Project Overview

The **Foot Over Bridge System** is a modern solution aimed at enhancing pedestrian safety and bridge management through a responsive web platform. Built using the MERN stack (MongoDB, Express, React, Node.js), it provides seamless user interaction, secure access, and reliable data management.

---

##  Tech Stack

| Layer        | Technology     |
|--------------|----------------|
| Frontend     | React.js       |
| Backend      | Node.js, Express.js |
| Authentication | JWT (JSON Web Tokens) |
| Database     | MongoDB (Mongoose ODM) |

---

##  Features

-  Secure user authentication using JWT
-  Admin dashboard for monitoring bridge status
-  Real-time foot traffic data display
-  Responsive UI for mobile and desktop
-  RESTful API for efficient backend communication

---

##  Installation & Setup

### 1. Clone the repository

git clone https://github.com/PRIYANSHUKESHRI01/footoverbridge.git
cd footoverbridge

### 2. Setup Backend
cd backend
npm install
#### Server configuration
PORT=5001

#### MongoDB connection
MONGO_URI=mongodb://localhost:27017/fob-management

#### JWT Secret
JWT_SECRET=yourSecretKey
JWT_EXPIRE=30d
npm start

## 3. Setup Frontend
cd ../frontend
npm install
npm start


