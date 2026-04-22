# BarangayHub - Barangay Management Information System (BMIS)

## Introduction

BarangayHub is a web-based platform designed to automate and digitize the operations of **Barangay Daine II**. The system allows residents to request documents, track their request status, and submit complaints or feedback digitally, while giving barangay staff the tools to manage resident records, process requests, and monitor barangay activity.

The platform has two main user roles:

- **Administrator (Barangay Secretary / Staff)** - manages residents, document requests, announcements, complaints, and system settings.
- **Resident (Public User)** - submits document requests, tracks request status, files complaints, and sends feedback without needing an account.

Each role has its own dedicated portal and interface to ensure efficient barangay management and secure resident services.

## Core Features

### Administrator Module

- Dashboard showing total residents, pending document requests, open complaints, and recent activity
- Post, edit, publish, and archive barangay announcements
- Add, update, and delete resident records (full CRUD with fuzzy search and CSV import)
- Process document request queue with workflow stages: Pending, Processing, Ready for Pickup, Completed, or Rejected
- View, assign urgency levels, and update the status of submitted complaints and blotter reports
- Read resident feedback and suggestions with sentiment tags
- Add or remove admin and staff accounts; assign roles (Secretary, Staff); toggle account status
- Generate and export PDF/CSV reports: Monthly Document Summary, Census Summary, Complaint Report, Annual Summary
- View immutable, color-coded activity logs of all admin actions
- Manage profile, change password, toggle MFA, and configure system preferences
- Secure logout via session termination

### Resident Module

- Access the public portal without requiring an account
- Select a service: request a document, track a request, file a complaint, or submit feedback
- Fill out and submit a document request form (Barangay Clearance, Certificate of Residency, Certificate of Indigency, Business Clearance, etc.)
- Receive a unique **BD2-YYYY-XXXX** tracking reference ID upon submission
- Track document request status using the reference ID (Pending, Processing, Ready for Pickup, Completed)
- Submit a complaint or blotter report with optional file attachment and receive a complaint reference ID
- Submit anonymous or named feedback and suggestions

## Security & System Features

- Role-based access control: residents interact anonymously via reference IDs; admin access requires authenticated sessions with MFA
- Row-Level Security (RLS) enforced on all database tables - public users cannot access resident records or activity logs
- Immutable audit logging - every admin create, update, delete, approve, or reject action is recorded in activity logs
- Non-sequential, non-guessable reference IDs (BD2-YYYY-XXXX) to prevent ID enumeration
- Only public Supabase keys are used in client-side code - the service role key is never exposed
- Real-time badge count updates for pending requests and new complaints
- Server-side pagination and filtering optimized for 4,800+ resident records
- Mobile-first responsive design for the Public Portal with hamburger navigation