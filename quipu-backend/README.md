# Quipu Backend API

Backend API for Quipu Financial App - A personal finance management system.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **ORM**: Prisma with PostgreSQL
- **Authentication**: JWT (Access + Refresh tokens)
- **Validation**: Zod
- **Testing**: Vitest
- **Password Hashing**: bcrypt

## Project Structure

```
quipu-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seed script
├── src/
│   ├── config/                # Configuration management
│   ├── modules/               # Feature modules (auth, profile, movements, goals, categories)
│   │   ├── auth/
│   │   │   ├── controller.ts
│   │   │   ├── service.ts
│   │   │   ├── validation.ts
│   │   │   └── routes.ts
│   │   ├── profile/
│   │   ├── movements/
│   │   ├── goals/
│   │   └── categories/
│   ├── shared/
│   │   └── middleware/        # Shared middleware (auth, error handling)
│   ├── utils/                 # Utilities (logger, prisma client)
│   └── index.ts               # Application entry point
├── docker-compose.yml         # PostgreSQL container
├── .env.example               # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)

### Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd quipu-backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Start PostgreSQL with Docker Compose:
```bash
docker-compose up -d
```

5. Generate Prisma client:
```bash
npm run prisma:generate
```

6. Run database migrations:
```bash
npm run prisma:migrate
```

7. Seed system categories:
```bash
npm run prisma:seed
```

8. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/logout-all` - Logout from all devices

### Profile

- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update user profile
- `POST /api/profile/change-password` - Change password

### Movements

- `GET /api/movements` - Get movements history
- `GET /api/movements/:id` - Get movement detail
- `POST /api/movements` - Create movement
- `PATCH /api/movements/:id` - Update movement
- `DELETE /api/movements/:id` - Delete movement

### Saving Goals

- `GET /api/goals` - Get saving goals
- `GET /api/goals/:id` - Get goal detail
- `POST /api/goals` - Create saving goal
- `PATCH /api/goals/:id` - Update saving goal
- `DELETE /api/goals/:id` - Delete saving goal
- `POST /api/goals/:id/contributions` - Add contribution to goal
- `POST /api/goals/:id/archive` - Archive completed goal

### Categories

- `GET /api/categories` - Get categories (system + user)
- `POST /api/categories` - Create custom category

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with system categories
- `npm run prisma:studio` - Open Prisma Studio

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing (min 32 characters)
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3001)

## Architecture

The backend follows a modular architecture based on requirement RM-001:

- **Separation of Concerns**: Each module (auth, profile, movements, goals, categories) is self-contained
- **Layered Architecture**: Routes → Controllers → Services → Database
- **Shared Middleware**: Authentication, error handling, and validation are centralized
- **Type Safety**: Full TypeScript with Zod validation schemas

## Database Design

The database uses PostgreSQL with the following key features:

- UUID primary keys for security and scalability
- Soft deletes for financial data (movements, goals, contributions)
- Indexed queries for performance
- Transaction support for atomic operations
- Audit logging for all critical operations

See `prisma/schema.prisma` for the complete schema definition.

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with 15-minute access token expiration
- Refresh tokens stored as SHA-256 hashes
- Refresh token rotation for security
- CORS configuration
- Helmet.js for security headers
- Input validation with Zod

## Testing

Run tests with:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## License

MIT
