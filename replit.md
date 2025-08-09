# Overview

This is an AI-powered career matching platform specifically designed for Korean seniors aged 50-60. The application connects experienced professionals with suitable job opportunities and helps companies find qualified candidates with rich experience. The platform features AI-driven profile analysis, job matching, and comprehensive career management tools.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes (August 2025)

## Complete Revert to Replit Auth and Individual Signup Removal
- **Date**: August 10, 2025 (Latest)
- **Changes**: Completely reverted from custom authentication back to Replit Auth and removed all individual signup functionality
  - **Complete Individual Signup Removal**: Deleted all individual user-related functionality
    - Removed individual signup pages, components, and all related files
    - Deleted individual profiles, job categories, and all individual-related database tables
    - Eliminated AI resume system, voice input, and natural language conversion features
    - Removed job matching, recommendations, and saved jobs functionality
  - **Revert to Replit Auth**: Switched back from custom authentication to original Replit Auth
    - Restored `isAuthenticated` middleware from Replit Auth blueprint
    - Updated user access back to `req.user.claims.sub` format
    - Replaced custom login/register endpoints with Replit Auth OAuth flow
    - All authentication now handles through `/api/login`, `/api/logout`, `/api/callback`
  - **Company-Only Focus**: Platform now exclusively serves company users
    - Company signup: Uses Replit Auth login then company profile creation
    - Welcome page: Shows only company signup option with individual disabled
    - Database schema: Cleaned up to only include users (Replit Auth) and company_profiles tables
  - **Database Cleanup**: Completely restructured database schema
    - Dropped all individual-related tables (individual_profiles, user_job_categories, etc.)
    - Users table reverted to Replit Auth schema (id, email, first_name, last_name, profile_image_url)
    - Maintained only company_profiles table for business functionality

## Login Flow Customization and Input Validation  
- **Date**: August 10, 2025
- **Changes**: Customized login process and improved user experience
  - **Input Validation**: Added validation to login form preventing empty submissions
    - Shows error message when ID or password fields are empty
    - No longer redirects to Replit Auth with blank credentials
  - **Modified Redirect Flow**: Changed post-login behavior
    - Success redirect: `/dashboard` → `/` (individual dashboard)
    - Failure redirect: `/api/login` → `/` (welcome screen)
    - Logout redirect: points to `/` (welcome screen) 
  - **Fixed 404 Error**: Resolved routing issue for authenticated users
    - Authenticated users now see dashboard at "/" instead of welcome screen
    - Eliminated infinite loading loops from auth query failures
    - Custom 401 error handling in useAuth hook prevents request spam
  - **User Experience**: Login button now requires actual input before processing
    - Prevents accidental navigation to Replit Auth
    - Provides clear feedback for missing credentials

## UI/UX Redesign and Navigation Fixes
- **Date**: August 10, 2025
- **Changes**: Complete UI overhaul and navigation flow optimization
  - **Design Replacement**: Implemented new login screen based on uploaded design mockups
    - Replaced welcome screen with clean gray gradient background
    - Added individual/company member tabs with proper styling
    - Implemented form fields matching design specifications
    - Added Naver login integration button
  - **Navigation Flow Fix**: Resolved login redirect loop issue
    - Fixed issue where login flow was: splash → login → splash → profile
    - Now properly flows: splash → login → dashboard
    - Modified auth callback to redirect to `/dashboard` instead of `/`
  - **Code Optimization**: Eliminated duplicate files and components
    - Removed duplicate logout buttons (was showing 2 in sidebar)
    - Deleted unused asset files: `background.png`, `login-design.png`
    - Enforced single file principle: modify existing files instead of creating duplicates
  - **Authentication**: Enhanced logout functionality in both header and sidebar

## Navigation and Data Synchronization Fixes
- **Date**: August 10, 2025 (Earlier)
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
- **Provider**: Custom authentication system with email/password login
- **Session Management**: PostgreSQL-backed session storage with express-session
- **User Types**: Dual authentication flows for individual users and companies
- **Security**: Password hashing with scrypt, HTTP-only cookies with CSRF protection
- **Middleware**: Custom requireAuth, requireIndividualAuth, and requireCompanyAuth middleware

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