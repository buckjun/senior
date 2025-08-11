# Overview

This is an AI-powered career matching platform specifically designed for Korean seniors aged 50-60. The application connects experienced professionals with suitable job opportunities and helps companies find qualified candidates with rich experience. The platform features AI-driven profile analysis, job matching, and comprehensive career management tools, aiming to be the leading career platform for this demographic in Korea.

# User Preferences

Preferred communication style: Simple, everyday language.

## Design Guidelines
- **Brand Consistency**: Use "일있슈" throughout the application (NOT "5060career")
- **Color Theme**: Use bright colors consistent with splash/login screens (#006FFD blue accent)
- **Design Integration**: NEVER separate old and new designs - always completely replace old design with new design
- **File Modification Rule**: Always modify existing files instead of creating duplicates

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Korean color schemes and typography (Noto Sans KR, Inter)
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Design Approach**: Responsive design with a focus on web app optimization, transitioning from mobile-first to desktop-friendly layouts.

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints under `/api` namespace
- **File Structure**: Monorepo structure with shared schema between client and server

## Authentication & Authorization
- **Provider**: Replit Auth integration with OpenID Connect
- **Session Management**: PostgreSQL-backed session storage with connect-pg-simple
- **User Types**: Dual authentication flows for individual users and companies
- **Security**: HTTP-only cookies with CSRF protection

## Data Storage
- **Primary Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Migrations**: Drizzle Kit for database schema management
- **File Storage**: Google Cloud Storage integration for resume uploads and company assets
- **Object ACL**: Custom access control system for file permissions

## AI Integration
- **Provider**: Google Gemini AI (gemini-2.5-flash) for natural language processing
- **Features**: AI-powered resume parsing from natural language Korean text, automatic skill extraction, real-time resume preview, Korean language optimization, job recommendations, and skills assessment.
- **Workflow**: Supports various input methods (text, image, voice) with a "parse → preview → user verification → manual apply → profile update" workflow.

## File Upload System
- **Library**: Uppy.js for drag-and-drop file handling
- **Storage**: Direct-to-GCS uploads with presigned URLs
- **Formats**: Support for HWP, DOCX, PDF resume formats
- **Processing**: AI-powered content extraction and analysis.

## Core Features
- **Job Matching System**: AI-driven sector and company recommendations based on user profiles. Features a priority-based matching algorithm (Field > Experience > Education > Employment type) and certification bonuses.
- **Resume Creation**: AI-powered resume generation with user preview and confirmation steps.
- **Course Recommendations**: Integrates offline and online course recommendations using Gemini AI, matching courses to user profiles.
- **UI/UX**: Consistent "일있슈" branding and bright blue (#006FFD) theme across all pages. Clean card-based UI, optimized navigation, and intuitive user flows.

# External Dependencies

## Core Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Google Cloud Storage**: File storage and CDN
- **Google Gemini AI**: AI-powered text analysis and generation
- **Replit Auth**: Authentication and user management

## Development Tools
- **Vite**: Frontend build tool and development server
- **Drizzle Kit**: Database schema management and migrations
- **TypeScript**: Type safety across the entire stack

## UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library for consistent iconography
- **Uppy**: File upload handling with progress tracking

## Korean Localization
- **Noto Sans KR**: Korean font family for proper text rendering
- **Korean-optimized AI prompts**: Tailored for 50-60 age demographic job market