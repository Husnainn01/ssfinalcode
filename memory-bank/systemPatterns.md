# System Patterns

## Architecture Overview

The application follows a modern Next.js-based architecture with the following key patterns:

### 1. Page-based Routing
- Uses Next.js App Router for defining routes and pages
- Admin and customer dashboards are separate route groups
- API routes are organized by entity and function

### 2. API Layer
- REST-style API built with Next.js API routes
- Entities have dedicated route handlers
- Actions on entities use nested route patterns (e.g., `/inquiries/[id]/archive`)
- Database operations are performed directly in API routes

### 3. UI Component Architecture
- Follows a component-based architecture
- Uses shadcn/ui pattern (built on Radix UI primitives)
- Components are organized by function rather than by page
- State is managed within components using React hooks

## Design Patterns

### 1. State Management
- Local component state with useState for UI state
- useEffect for side effects and data fetching
- API calls for data persistence

### 2. Data Fetching
- Direct fetch calls to API endpoints from components
- Loading states managed at component level
- Error handling with try/catch blocks
- Success and error notifications via toast components

### 3. Form Handling
- React Hook Form for form state management
- Zod schema validation for form validation
- Controlled components for form inputs

### 4. Modal Dialogs
- AlertDialog component for confirmations
- Dialog component for more complex forms or detailed views
- Dialog state managed locally in parent components

## Component Relationships

### 1. Page Components
- Top-level components that represent a route
- Responsible for fetching initial data
- Contain layout and composition of smaller components

### 2. UI Components
- Smaller, reusable components
- Handle specific UI concerns
- Accept props for customization
- Maintain internal state when needed

### 3. Shared Components
- Common UI elements like buttons, inputs, cards
- Follow consistent styling patterns
- Located in `/components/ui` directory

## Data Flow

### 1. Inquiry Management Flow
```
User action (archive) → handleArchive() → AlertDialog confirmation → 
archiveInquiry() → API call → Database update → Refresh data → UI update
```

### 2. General Data Flow Pattern
```
User interaction → Event handler → API call → 
Database operation → Response processing → State update → UI update
```

## Code Organization Patterns

### 1. File Structure
- Pages follow Next.js App Router conventions
- Components are grouped by function
- API routes mirror frontend routes

### 2. Component Structure
- Component definition with state at the top
- Effect hooks and handlers in the middle
- Return statement (JSX) at the bottom
- Helper functions below the component or extracted

### 3. API Structure
- HTTP method handlers (GET, POST, PATCH)
- Database connection
- Request validation
- Business logic
- Response formatting

## Authentication Pattern

- JWT-based authentication
- Auth state passed via HTTP headers (x-admin-id, x-admin-role)
- Role-based access control for admin functions
- API routes verify permissions before operations 