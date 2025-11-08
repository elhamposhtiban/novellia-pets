# Novellia Pets 🐾

A full-stack web application for managing medical records for pets. Built with React, Node.js, and PostgreSQL.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [How It Works](#how-it-works)
  - [Frontend Architecture](#frontend-architecture)
  - [Backend Architecture](#backend-architecture)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Development](#development)

## Overview

Novellia Pets is a medical records management system that allows pet owners to:

- Register and manage pet information
- Track vaccination records
- Record allergy information
- View dashboard statistics
- Export medical records

## Features

- **Pet Management**: Create, read, update, and delete pet records
- **Medical Records**: Track vaccines and allergies for each pet
- **Search & Filter**: Search pets by name and filter by animal type
- **Dashboard**: View statistics about pets and medical records
- **Export**: Download pet medical records as JSON
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Form Validation**: Client and server-side validation using Zod
- **Error Handling**: Comprehensive error handling and user feedback

## Tech Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Navigation
- **TanStack Query (React Query)** - Data fetching and caching
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Zod** - Schema validation

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **pg** - PostgreSQL client
- **Zod** - Input validation
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
novellia-pets/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/      # Business logic
│   │   ├── db/              # Database connection & schema
│   │   ├── routes/           # API routes
│   │   └── server.ts        # Entry point
│   ├── package.json
│   └── tsconfig.json
├── client/
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service functions
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main app component
│   │   └── index.tsx        # Entry point
│   ├── package.json
│   └── tailwind.config.js
└── package.json             # Root package.json for running both
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd novellia-pets
   ```

2. **Install dependencies**

   ```bash
   npm run install-all
   ```

3. **Set up PostgreSQL database**

   ```bash
   # Create database
   createdb novellia_pets

   # Or using psql:
   psql -U postgres
   CREATE DATABASE novellia_pets;
   ```

4. **Configure environment variables**

   Create `backend/.env` file:

   ```env
   PORT=5000
   NODE_ENV=development
   DB_USER=your_db_user
   DB_HOST=localhost
   DB_NAME=novellia_pets
   DB_PASSWORD=your_db_password
   DB_PORT=5432
   CORS_ORIGIN=http://localhost:3001
   ```

5. **Start the application**

   ```bash
   npm run dev
   ```

   This will start:

   - Backend server on `http://localhost:5000`
   - Frontend app on `http://localhost:3001`

## How It Works

### Frontend Architecture

The frontend is built with React and follows a component-based architecture.

#### **Data Flow**

1. **React Query (TanStack Query)**

   - Manages server state (pets, records, dashboard stats)
   - Handles caching, refetching, and loading states
   - Automatically refetches when data changes

2. **Service Layer** (`src/services/`)

   - `api.ts`: Axios instance with base configuration
   - `petService.ts`: Pet-related API calls
   - `recordService.ts`: Medical record API calls

3. **Components**

   - **Pages**: Main route components (Dashboard, PetList, PetDetail, EditPet)
   - **Reusable Components**: Modal, FormField, FormButtons, Loading, Error, etc.
   - **Feature Components**: PetCard, MedicalRecordCard, PetInfoCard

4. **State Management**
   - React Query for server state
   - React useState for local component state
   - Form state managed in form components

#### **Key Frontend Concepts**

**React Query (`useQuery`)**

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["pets", debouncedSearch, animalType],
  queryFn: async () => {
    const response = await petService.getAll(search, animalType);
    return response.data;
  },
});
```

- `queryKey`: Unique identifier for caching (changes trigger refetch)
- `queryFn`: Function that fetches data
- Automatically handles loading, error, and caching

**Form Validation**

- Client-side: Zod schemas in components
- Server-side: Zod validation in controllers
- Real-time error clearing when user types

**Component Composition**

- Modal component uses `children` prop for flexible content
- FormField component wraps inputs with labels and errors
- Reusable components reduce code duplication

### Backend Architecture

The backend follows a RESTful API design with clear separation of concerns.

#### **Request Flow**

```
Client Request
    ↓
Express Middleware (CORS, JSON parsing)
    ↓
Routes (src/routes/)
    ↓
Controllers (src/controllers/)
    ↓
Database (PostgreSQL via pg)
    ↓
Response
```

#### **Layers**

1. **Routes** (`src/routes/`)

   - Define API endpoints
   - Map HTTP methods to controller functions
   - Centralized in `routes/index.ts`

2. **Controllers** (`src/controllers/`)

   - Business logic
   - Input validation with Zod
   - Database queries
   - Error handling

3. **Database** (`src/db/`)

   - Connection pooling with `pg.Pool`
   - Schema initialization
   - Query helper functions

4. **Configuration** (`src/config/`)
   - Environment variable management
   - Centralized config object

#### **Key Backend Concepts**

**Parameterized Queries**

```typescript
await query("SELECT * FROM pets WHERE id = $1", [petId]);
```

- Prevents SQL injection
- Safe and efficient

**Zod Validation**

```typescript
const result = createPetSchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ error: "Validation failed" });
}
```

- Validates input before processing
- Returns clear error messages

**Error Handling**

- Try-catch blocks in controllers
- Proper HTTP status codes
- Consistent error response format

## API Endpoints

### Pets

- `GET /api/pets` - Get all pets (with optional search and filter)
  - Query params: `?search=name&animal_type=dog`
- `GET /api/pets/:id` - Get pet by ID
- `POST /api/pets` - Create new pet
- `PATCH /api/pets/:id` - Update pet
- `DELETE /api/pets/:id` - Delete pet

### Medical Records

- `GET /api/records/pet/:petId` - Get all records for a pet
- `GET /api/records/:id` - Get record by ID
- `POST /api/records/pet/:petId` - Create new record
- `PATCH /api/records/:id` - Update record
- `DELETE /api/records/:id` - Delete record

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics

## 🗄 Database Schema

### `pets` Table

```sql
CREATE TABLE pets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  animal_type VARCHAR(100) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `medical_records` Table

```sql
CREATE TABLE medical_records (
  id SERIAL PRIMARY KEY,
  pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  record_type VARCHAR(50) NOT NULL CHECK (record_type IN ('vaccine', 'allergy')),
  name VARCHAR(255) NOT NULL,
  date DATE,
  reactions TEXT,
  severity VARCHAR(20) CHECK (severity IN ('mild', 'severe')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Relationships:**

- One pet can have many medical records
- `ON DELETE CASCADE`: Deleting a pet automatically deletes its records

## 💻 Development

### Running in Development Mode

```bash
npm run dev
```

This runs both frontend and backend concurrently with hot reload.

### Building for Production

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd client
npm run build
```

### Code Structure Best Practices

**Frontend:**

- Components are organized by feature and reusability
- Custom hooks for shared logic (`useDebounce`)
- Utility functions for validation and error handling
- TypeScript types defined in `src/types/`

**Backend:**

- Controllers handle business logic
- Routes define API structure
- Database queries use parameterized statements
- Validation happens at controller level

## 🎨 UI/UX Features

- **Debounced Search**: Reduces API calls while typing
- **Loading States**: Shows spinners during data fetching
- **Error Handling**: User-friendly error messages
- **Form Validation**: Real-time validation feedback
- **Modal Dialogs**: For forms and confirmations
- **Responsive Design**: Works on desktop and mobile

## 📝 Notes

- Frontend runs on port 3001 to avoid conflicts
- Backend runs on port 5000
- Database schema is automatically created on server start
- All API endpoints are prefixed with `/api`
- CORS is configured to allow requests from frontend origin

## 🔒 Security

- SQL injection prevention via parameterized queries
- Input validation on both client and server
- CORS configured for specific origin
- Environment variables for sensitive data

## 📄 License

ISC
