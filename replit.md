# Overview

This is an AI-powered career matching platform specifically designed for Korean seniors aged 50-60. The application connects experienced professionals with suitable job opportunities and helps companies find qualified candidates with rich experience. The platform features AI-driven profile analysis, job matching, and comprehensive career management tools.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes (August 2025)

## Complete Rebuild with PNG-First Approach
- **Date**: August 10, 2025 - 7:22 PM  
- **Changes**: Complete rebuild eliminating all previous design systems per user feedback
  - **Problem Identified**: Previous approach overlaid complex design systems onto PNG files causing click issues
  - **Solution**: Removed all existing pages, components, hooks, and design systems
  - **PNG-First Architecture**: Each PNG file is a complete, unmodified UI screen with full-screen click navigation
  - **Simplified Structure**: Basic React app with wouter routing and simple FramePage component
  - **Frame Sequence**: Following Pixso HTML structure: 83-1499 → 83-1531 → 83-1550 → 83-1576 → 83-1874 → 83-1842 → 83-1947 → 83-1599 → 83-1956
  - **No Custom UI**: Zero custom components, zero design interpretation, zero overlays
  - **Full Click Area**: Entire image area is clickable for navigation to next frame
  - **Key Learning**: PNG files ARE the complete UI - never add anything on top of them

## Mobile-First Design System Implementation
- **Date**: August 10, 2025 - 6:00 PM
- **Changes**: Complete mobile design system overhaul using original bright theme design
  - **New Design System**: Implemented light theme color palette with warm cream background (#fef7e6) and orange accents (#ff6b35)
  - **Mobile Layout Components**: Created MobileLayout.tsx with header, bottom navigation, and responsive structure
  - **Mobile UI Components**: Built MobileCard, MobileButton, MobileInput components optimized for touch
  - **Mobile Dashboard**: Implemented mobile-optimized dashboard with card-based layout and AI resume integration
  - **Landing Page**: Created new mobile-first landing page with warm colors matching original "일있슈" design
  - **Navigation System**: Unified navigation using wouter routing with mobile-optimized touch targets
  - **Typography**: Changed to Noto Sans KR font for better Korean text rendering at 14px base size
  - **Light Theme**: Applied consistent bright theme across all components matching original design files
  - **Responsive Design**: 393x852px mobile-first approach with touch-friendly interactions
  - **Authentication Integration**: Maintained all existing authentication flows and session management

## Previous Updates

## Navigation and Data Synchronization Fixes  
- **Date**: August 10, 2025
- **Changes**: Unified "내정보" button navigation and improved data synchronization
  - Fixed all "내정보" buttons to navigate to `/individual/profile-view` consistently
  - Enhanced profile-view.tsx to display comprehensive profile information and resume summary
  - Added AI analysis results section to profile view
  - Improved data synchronization: profile updates now immediately reflect in:
    - Profile view pages (`/api/individual-profiles/me`)
    - Job recommendations (`/api/jobs/recommended`)
    - Company recommendations (`/api/recommendations`)
  - Added multiple cache invalidation for real-time updates across all sections
  - Users can now see updated profile information immediately after AI resume generation

## Job Category Selection and Company Recommendation System
- **Date**: August 9, 2025 
- **Changes**: Complete implementation of job category selection and company recommendation workflow
  - Successfully imported and cleaned 265 unique company records (removed 83 duplicates) across 9 industry categories
  - Built JobCategorySelector component with 1-2 category selection limit
  - Created job-category-selection page with progress indicator and user guidance
  - Implemented company-recommendations page with detailed matching scores and company info
  - Added storage methods for job categories and user selections
  - Created matching algorithm with priority system: Field > Experience > Education > Employment type
  - Added certification bonus system for relevant qualifications
  - Integrated complete API endpoints: /api/job-categories, /api/user/job-categories, /api/recommendations
  - Fixed navigation bugs: Profile pages now navigate back to dashboard instead of login
  - Added job category selection button to dashboard for seamless user workflow
  - Total companies per category after cleanup: 예술(25), 의료(18), 정보통신(38), 운수 및 창고업(30), 제조업(81), 마케팅(29), 과학 기술 서비스업(25), 공급업(19)

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
- **UI Components**: shadcn/ui component library with custom mobile-optimized components
- **Mobile Design System**: Custom MobileLayout, MobileCard, MobileButton components
- **Styling**: Tailwind CSS with Pixso-based dark theme design tokens
- **Typography**: Noto Sans KR at 14px base size for Korean text optimization
- **Color Palette**: Light theme with warm cream background (#fef7e6) and orange primary accent (#ff6b35)
- **Routing**: Wouter for lightweight client-side routing with mobile navigation
- **State Management**: TanStack Query for server state management
- **Mobile-First Design**: 393x852px mobile viewport with touch-optimized interactions

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