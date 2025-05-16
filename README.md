# Medical Backend API

A robust and scalable backend API for a medical management system built with Node.js, Express, TypeScript, and MongoDB.

## Features

- User authentication and authorization
- Patient management
- Doctor management
- Appointment scheduling
- Secure password handling
- Input validation
- Error handling
- TypeScript support
- MongoDB integration

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd medical-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add the following variables:

```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/medical_db
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

4. Start the development server:

```bash
npm run dev
```

## API Endpoints

### Authentication

- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/profile - Get user profile

### Patients

- GET /api/patients - Get all patients
- GET /api/patients/:id - Get patient by ID
- POST /api/patients - Create new patient
- PUT /api/patients/:id - Update patient
- DELETE /api/patients/:id - Delete patient

### Doctors

- GET /api/doctors - Get all doctors
- GET /api/doctors/:id - Get doctor by ID
- POST /api/doctors - Create new doctor
- PUT /api/doctors/:id - Update doctor
- DELETE /api/doctors/:id - Delete doctor

### Appointments

- GET /api/appointments - Get all appointments
- GET /api/appointments/:id - Get appointment by ID
- POST /api/appointments - Create new appointment
- PUT /api/appointments/:id - Update appointment
- DELETE /api/appointments/:id - Delete appointment

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Security

- Passwords are hashed using bcrypt
- JWT for authentication
- Input validation using express-validator
- CORS enabled
- Helmet for security headers

## License

MIT
