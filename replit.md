# Overview

This is an AI-powered career matching platform specifically designed for Korean seniors aged 50-60. The application connects experienced professionals with suitable job opportunities and helps companies find qualified candidates with rich experience. The platform features AI-driven profile analysis, job matching, and comprehensive career management tools.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes (August 2025)

## Complete Design Overhaul
- **Date**: August 9, 2025
- **Changes**: Complete redesign from mobile-first to web app optimized design
  - Replaced Noto Sans KR with Inter font for better web app appearance  
  - Scaled down all typography sizes for desktop/web use (14px base instead of 18px)
  - Redesigned dashboard with sidebar navigation and card-based layout
  - Removed mobile-specific elements (bottom navigation, large touch targets)
  - Implemented professional web app color palette and spacing
  - Added desktop-optimized header with search and user menu
  - Created compact, efficient layouts suitable for desktop screens

## AI Resume System Implementation
- **Date**: August 9, 2025
- **Changes**: Complete implementation of AI-powered resume generation system
  - Integrated Google Gemini AI for Korean natural language processing
  - Built real-time preview system with ResumePreview component  
  - Implemented complete workflow from text input to profile update
  - Added example input functionality for testing ("문동주" baseball player example)
  - Verified successful parsing and profile updates through server logs

## Navigation System Fixes
- **Date**: August 9, 2025  
- **Changes**: Unified all profile navigation paths
  - Fixed 404 errors in bottom navigation
  - Connected top-right profile avatar and bottom-right "내정보" button to same route
  - Added SavedJobs page for "찜한공고" functionality
  - All profile-related buttons now route to `/individual/profile-setup`

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Korean color schemes and typography (Noto Sans KR)
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Mobile-First Design**: Responsive layout with dedicated mobile navigation components

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints under `/api` namespace
- **File Structure**: Monorepo structure with shared schema between client and server
- **Development**: Hot module replacement via Vite integration

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
- **Features**: 
  - AI-powered resume parsing from natural language Korean text
  - Automatic skill extraction optimized for 5060 generation
  - Real-time resume preview with structured data
  - Korean language optimization for senior job seekers
  - Complete workflow: text input → AI analysis → preview → profile update
- **Use Cases**: Resume generation, profile enhancement, job recommendations, skills assessment

## File Upload System
- **Library**: Uppy.js for drag-and-drop file handling
- **Storage**: Direct-to-GCS uploads with presigned URLs
- **Formats**: Support for HWP, DOCX, PDF resume formats
- **Processing**: AI-powered content extraction and analysis

## Mobile Experience
- **Navigation**: Bottom tab navigation optimized for touch interfaces
- **Responsive**: Mobile-first design with touch-friendly interactions
- **Performance**: Optimized bundle splitting and lazy loading

# External Dependencies

## Core Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Google Cloud Storage**: File storage and CDN
- **OpenAI API**: AI-powered text analysis and generation
- **Replit Auth**: Authentication and user management

## Development Tools
- **Vite**: Frontend build tool and development server
- **Drizzle Kit**: Database schema management and migrations
- **TypeScript**: Type safety across the entire stack

## UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library for consistent iconography

## File Processing
- **Uppy**: File upload handling with progress tracking
- **Google Cloud SDK**: Server-side file operations

## Korean Localization
- **Noto Sans KR**: Korean font family for proper text rendering
- **Korean-optimized AI prompts**: Tailored for 50-60 age demographic job market