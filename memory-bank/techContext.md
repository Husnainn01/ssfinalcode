# Technical Context

## Technology Stack

### Frontend
- **Framework**: Next.js 14.2.5 (slightly outdated from latest)
- **Language**: JavaScript/TypeScript
- **UI Component Library**: 
  - Custom components based on Radix UI primitives
  - Shadcn/UI component patterns
- **State Management**: React hooks and context
- **Styling**: Tailwind CSS with custom utilities
- **Icons**: React Icons (FaIcons from Font Awesome)
- **Form Handling**: React Hook Form with Zod validation

### Backend
- **API**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: Custom JWT-based auth
- **File Storage**: Cloudinary for document storage
- **Email Service**: Not fully identified, likely using a third-party service

## Database Schema

### Key Collections
1. **customerInquiries**
   - Contains customer questions and support requests
   - Includes fields: subject, message, customerName, customerEmail, status, category, createdAt, updatedAt
   - Tracks status (pending, answered, closed)
   - Contains isArchived flag for archive status

2. **agreedvehicles**
   - Stores information about vehicles with agreed purchase prices
   - Connected to inquiries through vehicleId reference

3. **customerusers**
   - User accounts for customers
   - Contains personal information and authentication details

4. **cars**
   - General car listing information

### Relationships
- Inquiries reference vehicles through vehicleId
- Inquiries connect to customers through userId/customerId
- Vehicles can have multiple associated documents

## Technical Constraints

1. **Database Design**: The system uses separate collections that need to be linked correctly (customerInquiries, agreedvehicles)

2. **UI Components**: Custom components need to be properly implemented and imported, such as the AlertDialog component

3. **API Structure**: Uses route-based API with specific endpoints for different actions

4. **Query Construction**: MongoDB queries need to handle cases where fields might not exist (e.g., isArchived field)

## Development Environment

- **OS**: macOS (darwin 24.3.0)
- **Shell**: /bin/zsh
- **Package Manager**: npm (based on package.json)
- **Repository**: Git (structure suggests a standard Next.js project layout)

## Third-Party Integrations

1. **Document Storage**: Cloudinary API for storing shipping documents
2. **Shipping Tracking**: In process of implementing or considering:
   - MarineTraffic API
   - VesselFinder API
   - AISHub
3. **Payment Processing**: Not fully implemented/identified in current codebase

## Code Organization

1. **Directory Structure**:
   - `/src/app`: Next.js app router structure
   - `/src/app/admin/dashboard/`: Admin dashboard features
   - `/src/app/customer-dashboard/`: Customer-facing dashboard
   - `/src/app/api/`: API routes
   - `/src/components/`: Reusable UI components
   - `/src/lib/`: Utility functions and database connection

2. **API Routes Pattern**:
   - `/api/admin/inquiries`: List/filter inquiries
   - `/api/admin/inquiries/[id]`: Get specific inquiry
   - `/api/admin/inquiries/[id]/archive`: Archive specific inquiry
   - `/api/admin/inquiries/[id]/unarchive`: Unarchive inquiry
   - `/api/admin/inquiries/[id]/reply`: Reply to inquiry
   - `/api/admin/inquiries/[id]/forward`: Forward inquiry
   - `/api/admin/inquiries/[id]/status`: Update inquiry status
   - `/api/admin/inquiries/[id]/agree-price`: Process price agreement 