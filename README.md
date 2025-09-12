# Medical Project - DOM Server Side

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

A full-stack medical project application with DOM (Document Object Model) server-side rendering capabilities. Built with modern technologies for scalability and performance.

## 🚀 Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Robust relational database
- **JWT** - Secure authentication
- **TypeScript** - Type-safe development

### Frontend
- **Next.js 15** - React framework with SSR
- **TailwindCSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **React Hook Form** - Performant forms
- **TypeScript** - Type-safe development

## 🐳 Quick Start with Docker

```bash
# Clone and navigate to project
cd /path/to/project

# Start all services
docker-compose up --build

# Access applications
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

## 📁 Project Structure

```
├── backend/          # NestJS API server
│   ├── src/         # Source code
│   ├── prisma/      # Database schema & migrations
│   └── Dockerfile   # Backend containerization
├── frontend/         # Next.js application
│   ├── src/         # Source code
│   └── Dockerfile   # Frontend containerization
└── docker-compose.yml # Service orchestration
```

## 🔧 Development

### Backend
```bash
cd backend
npm install
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🗄️ Database

The application uses PostgreSQL with Prisma ORM for:
- User management and authentication
- DOM entities and relationships
- Game and machine management
- Experience tracking
- Role-based access control

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_ACCESS_SECRET` - JWT signing secret
- `JWT_EXPIRATION_TIME` - Token expiration

## 🐋 Docker Services

| Service  | Port | Description |
|----------|------|-------------|
| Frontend | 3000 | Next.js application |
| Backend  | 3001 | NestJS API server |
| Database | 5432 | PostgreSQL database |

---

**Built with ❤️ for medical applications**
