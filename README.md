# M&A CRM - Deal Pipeline Management System

A specialized M&A CRM for managing deal pipelines, target companies, contacts, interactions, due diligence documents, and NDAs.

## Architecture

- **Backend**: Django 5 + Django REST Framework, PostgreSQL
- **Frontend**: React 18 + Vite, TypeScript, shadcn/ui + Tailwind
- **Auth**: JWT with role-based access control
- **Storage**: MinIO (S3-compatible) for development

## Quick Start

1. Clone and navigate to project:
```bash
git clone <repo-url>
cd ma-crm
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Start all services:
```bash
docker compose up -d
```

4. Run database migrations and seed data:
```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed_mvp
```

5. Create admin user (optional, one is created by seed):
```bash
docker compose exec backend python manage.py createsuperuser
```

## Access Points

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000/api/v1/
- **Admin**: http://localhost:8000/admin/
- **MinIO Console**: http://localhost:9001 (admin/password123)

## Default Users (created by seed)

- **Admin**: admin@example.com / admin123
- **Associate**: associate@example.com / associate123  
- **Analyst**: analyst@example.com / analyst123

## Development

### Backend Development

```bash
# Enter backend container
docker compose exec backend bash

# Run tests
python manage.py test

# Create new migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Run linting
black .
isort .
flake8 .
```

### Frontend Development

```bash
# Enter frontend container
docker compose exec frontend bash

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run type-check
```

## API Documentation

### Authentication
- POST `/auth/login/` - Login with email/password
- POST `/auth/refresh/` - Refresh JWT token

### Core Endpoints
- `/api/v1/companies/` - Company management
- `/api/v1/contacts/` - Contact management  
- `/api/v1/deals/` - Deal management
- `/api/v1/deals/kanban/` - Kanban pipeline view
- `/api/v1/stages/` - Pipeline stages
- `/api/v1/interactions/` - Interactions/notes
- `/api/v1/tasks/` - Task management
- `/api/v1/documents/` - Document management
- `/api/v1/documents/upload/` - File upload
- `/api/v1/ndas/` - NDA tracking

### Filters & Pagination
- Standard pagination with `page` and `page_size`
- Common filters: `stage`, `owner`, `company`, `date_range`
- Search capabilities on relevant fields

## Roles & Permissions

- **Admin**: Full access to all entities
- **Associate**: Read/write access to team deals and reference data
- **Analyst**: Read/write access to assigned deals, read access to reference data

## Docker Services

- **backend**: Django application server
- **frontend**: React development server  
- **db**: PostgreSQL database
- **minio**: S3-compatible file storage
- **nginx**: Reverse proxy and static file serving

## Production Deployment

The application is designed for PaaS deployment (Render, Railway, etc.):

1. Build and push Docker images
2. Set up PostgreSQL database
3. Configure S3-compatible storage
4. Set environment variables
5. Run migrations and seed data

See `docker-compose.prod.yml` for production configuration example.

## File Structure

```
ma-crm/
├── backend/               # Django application
│   ├── ma_crm/           # Project settings
│   ├── apps/             # Django apps
│   └── requirements.txt  # Python dependencies
├── frontend/             # React application
│   ├── src/              # Source code
│   └── package.json      # Node dependencies  
├── infra/                # Infrastructure
│   ├── docker-compose.yml
│   └── nginx/            # Nginx configuration
└── .env.example          # Environment template
```
