# Database Setup Guide

## Overview

This document describes the database schema and setup for the AI PowerPoint Generator backend.

## Database Schema

### Tables

#### users
- `id` (UUID, Primary Key) - Unique user identifier
- `email` (VARCHAR, Unique) - User email address
- `name` (VARCHAR) - User display name
- `password_hash` (VARCHAR) - Hashed password
- `subscription` (VARCHAR) - Subscription type ('free' or 'premium')
- `usage_count` (INTEGER) - Number of presentations generated
- `is_active` (BOOLEAN) - Account status
- `created_at` (TIMESTAMP) - Account creation time
- `updated_at` (TIMESTAMP) - Last update time

#### ppt_themes
- `id` (UUID, Primary Key) - Unique theme identifier
- `name` (VARCHAR) - Theme name
- `description` (TEXT) - Theme description
- `preview_image` (VARCHAR) - Preview image URL
- `color_scheme` (JSONB) - Color scheme configuration
- `font_family` (VARCHAR) - Default font family
- `layout_templates` (JSONB) - Layout template configurations
- `is_active` (BOOLEAN) - Theme availability status
- `created_at` (TIMESTAMP) - Theme creation time
- `updated_at` (TIMESTAMP) - Last update time

#### generation_history
- `id` (UUID, Primary Key) - Unique generation identifier
- `user_id` (UUID, Foreign Key) - Reference to users table
- `original_outline` (TEXT) - User's input outline
- `generated_content` (JSONB) - AI-generated slide content
- `selected_theme` (VARCHAR) - Selected theme name
- `file_url` (VARCHAR) - Generated PPT file URL
- `status` (VARCHAR) - Generation status ('pending', 'completed', 'failed')
- `error_message` (TEXT) - Error message if generation failed
- `created_at` (TIMESTAMP) - Generation start time
- `completed_at` (TIMESTAMP) - Generation completion time

## Setup Instructions

### Prerequisites

1. PostgreSQL 12+ installed and running
2. Node.js 18+ installed
3. Environment variables configured

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/ai_ppt_db
```

### Database Initialization

1. Create the database:
```sql
CREATE DATABASE ai_ppt_db;
```

2. Run migrations and seeds:
```bash
npm run db:init
```

Or run them separately:
```bash
npm run db:migrate  # Run migrations only
npm run db:seed     # Run seeds only
```

### Available Scripts

- `npm run db:init` - Initialize database (migrations + seeds)
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Run database seeds

## Repository Classes

### UserRepository
- `create(userData)` - Create new user
- `findById(id)` - Find user by ID
- `findByEmail(email)` - Find user by email
- `update(id, updateData)` - Update user data
- `incrementUsageCount(id)` - Increment usage counter
- `deactivate(id)` - Deactivate user account

### PptThemeRepository
- `create(data)` - Create new theme
- `findById(id)` - Find theme by ID
- `findActive()` - Get all active themes
- `update(id, updateData)` - Update theme data
- `activate(id)` / `deactivate(id)` - Toggle theme status

### GenerationHistoryRepository
- `create(data)` - Create generation record
- `findById(id)` - Find generation by ID
- `findByUserId(userId)` - Get user's generation history
- `markAsCompleted(id, content, fileUrl)` - Mark as completed
- `markAsFailed(id, errorMessage)` - Mark as failed
- `getStatsByUserId(userId)` - Get user statistics

## Default Themes

The system comes with 4 pre-configured themes:

1. **Professional Blue** - Business presentations
2. **Modern Green** - Fresh and natural
3. **Creative Orange** - Energetic and creative
4. **Academic Purple** - Educational and research

## Testing

Run database tests:
```bash
npm test -- database.test.ts
```

## Migration System

The migration system automatically tracks which migrations have been executed and prevents duplicate runs. Each migration has:

- Unique ID and name
- `up()` method for applying changes
- `down()` method for rollback (if needed)

New migrations should be added to the `src/migrations/` directory and registered in `src/migrations/index.ts`.