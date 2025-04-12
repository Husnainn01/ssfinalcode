# Project Brief: Shipping Management System

## Project Overview
This project is a comprehensive shipping and vehicle management system designed to help customers track shipments, manage documents, and interact with the company through inquiries. The system includes both customer-facing interfaces and an administrative dashboard.

## Core Features
1. **Customer Dashboard**
   - Shipment tracking with real-time updates
   - Document management (invoices, purchase agreements, customs forms, etc.)
   - Inquiry system for customer support

2. **Admin Dashboard**
   - Inquiry management system with archive functionality
   - Vehicle management for tracking vehicles in transit
   - Customer information management
   - Document processing and organization

3. **API Integrations**
   - Integration with shipping APIs for tracking
   - Payment processing
   - Document storage and retrieval

## Technology Stack
- **Frontend**: Next.js 14.x with React
- **Backend**: Node.js with Next.js API routes
- **Database**: MongoDB
- **UI Components**: Custom UI components using Radix UI
- **Styling**: Tailwind CSS
- **Icons**: React Icons
- **Authentication**: Custom authentication system

## Current Focus
The current development focus is on the admin dashboard's inquiry management system, particularly:
- Implementing proper archive functionality for customer inquiries
- Fixing UI components to use proper dialog boxes instead of browser prompts
- Connecting to the right database collections
- Ensuring proper data flow between different parts of the application

## Key Entities
1. **Inquiries**: Customer questions and support requests stored in `customerInquiries` collection
2. **Vehicles**: Vehicle shipment information stored in `agreedvehicles` collection
3. **Documents**: Various shipping documents categorized by type
4. **Users**: Both admin users and customers with different access levels 