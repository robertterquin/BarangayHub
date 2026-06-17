# GitHub Copilot Instructions - BarangayHub (BMIS)

## Project Overview

BarangayHub is a full-stack Barangay Management Information System (BMIS) for Barangay Daine II, Indang, Cavite. It has two portals:

- Public Resident Portal: the resident-facing website for online services, tracking, complaints, feedback, announcements, and officials.
- Admin Portal: the barangay staff dashboard for managing residents, requests, complaints, announcements, officials, reports, users, activity history, feedback, and settings.

The latest visual reference is `UI.pdf` from the project assets shared by the user. Pages 1-13 show the public portal flow. Pages 14-35 show the admin portal flow.

## Critical Requirements

- Public users land on `/`; admins access the admin portal through `/admin/login`.
- Keep the dual-aesthetic system: public pages use a bright blue civic theme; admin pages use the darker sidebar/admin dashboard theme shown in the mockups.
- Public pages must be mobile-first and include hamburger navigation.
- Admin pages must be wrapped in `AdminLayout`; public pages must be wrapped in `PublicLayout`.
- All Supabase access must go through service files in `src/services/`, not directly from page components.
- RLS must stay enabled. Public users must not directly browse private admin tables.
- Activity history must record admin actions through database triggers and/or explicit service logs where triggers do not apply.
- Reference IDs must use the `BD2-YYYY-XXXX` format for document/resident references and `BLOTTER-YYYY-XXXX` for complaints.

## Current Tech Stack

### Frontend

| Tool | Version / Role |
|---|---|
| React | 19.x |
| TypeScript | Strict mode |
| Vite | App bundler |
| Tailwind CSS | Styling |
| Lucide React | Icons |
| Recharts | Admin charts/reports visuals |

### Backend / Database

- Supabase PostgreSQL
- Supabase Auth for admin email/password login
- Supabase Storage for complaint attachments, announcement images, and official photos
- Supabase Realtime for live admin badges, notifications, and activity updates
- Security-definer RPC functions for public submissions and public tracking

Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` may be used in frontend code. Never expose a service role key in the client.

## Current Repo Structure

```text
src/
  components/
    ui/                   # Shared atomic UI elements
    admin/                # Admin-specific reusable components

  pages/
    admin/
      auth/
        Login.tsx
        ResetPassword.tsx
      main/
        Dashboard.tsx
      management/
        Residents.tsx
        DocumentRequests.tsx
        Complaints.tsx
        Announcements.tsx
        Officials.tsx
      analytics/
        Reports.tsx
      system/
        UserManagement.tsx
        ActivityLogs.tsx
        Feedback.tsx
        Settings.tsx

    public/               # To be built for the resident portal

  layouts/
    AdminLayout.tsx
    PublicLayout.tsx

  services/
    supabase.ts
    adminService.ts
    publicService.ts
    reportService.ts
    serviceError.ts

  hooks/
    useAuth.ts
    useStats.ts
    useDashboard.ts
    useResidents.ts
    useDocumentRequests.ts
    useComplaints.ts
    useAnnouncements.ts
    useOfficials.ts
    useReports.ts
    useUserManagement.ts
    useActivityLogs.ts
    useFeedback.ts
    useSettings.ts

  types/
    database.ts

  utils/
    formatters.ts
    idGenerator.ts
```

## Public Portal From UI.pdf

The public portal is the default resident-facing side of the system.

### Public Workflow

The workflow shown in `UI.pdf` is:

1. Access website.
2. Select service.
3. Fill out request form.
4. Submit request.
5. System records the request.
6. Wait for processing.
7. Receive notification or claim document.

### Public Pages To Build

| Route | Page | Purpose |
|---|---|---|
| `/` | Landing Page | Barangay Daine II Online Services hero, statistics, latest announcements, quick actions, and intro content. |
| `/select-service` | Service Selection | Service cards for document requests, tracking, complaints/blotter, announcements, officials, and feedback. |
| `/request-document` | Document Request | Resident document request form using `submitDocumentRequest`. |
| `/submission-success` | Success Page | Shows tracking code/reference ID and next steps after public submissions. |
| `/track-status` | Track Status | Lets residents input a tracking code and view current status using `trackRequest`. |
| `/submit-complaint` | Complaint / Blotter | Complaint form with optional file upload using `uploadComplaintAttachment` and `submitComplaint`. |
| `/announcements` | Announcements | Public list of published announcements using `getPublishedAnnouncements`. |
| `/officials` | Officials | Public officials directory using `getPublicOfficials`. |
| `/feedback` | Feedback | Resident feedback/suggestion form using `submitFeedback`. |

### Public Visual Direction

- Use the blue civic theme from the PDF.
- Use large hero sections, rounded white cards, blue grid/gradient backgrounds, and friendly service cards.
- Preserve a polished government-service feel, not a generic landing page.
- Public pages should be responsive first on mobile, then expanded for desktop.
- Keep footer contact links and barangay identity visible.

## Admin Portal

The current admin side closely matches the PDF's main management screens:

- Login and reset password
- Dashboard
- Resident Management
- Document Requests
- Complaints / Blotter
- Announcements
- Barangay Officials
- Reports
- User Management
- Activity History
- Feedback & Suggestions
- Settings
- Logout

### Admin Route Structure

| Route | Page |
|---|---|
| `/admin/login` | Admin Login |
| `/admin/reset-password` | Reset Password |
| `/admin/dashboard` | Dashboard |
| `/admin/residents` | Resident Management |
| `/admin/document-requests` | Document Requests |
| `/admin/complaints` | Complaints / Blotter |
| `/admin/announcements` | Announcements |
| `/admin/officials` | Barangay Officials |
| `/admin/reports` | Reports |
| `/admin/users` | User Management |
| `/admin/activity-logs` | Activity History |
| `/admin/history` | Redirects to `/admin/activity-logs` |
| `/admin/feedback` | Feedback & Suggestions |
| `/admin/settings` | Settings |

### Admin Sidebar Structure

Current sidebar grouping:

```text
MAIN
  Dashboard

MANAGEMENT
  Resident Management
  Document Requests
  Complaints / Blotter
  Announcements
  Barangay Officials

ANALYTICS
  Reports

SYSTEM
  User Management
  Activity History
  Feedback & Suggestions
  Settings

BOTTOM
  Logout
```

### Admin Authentication Note

`UI.pdf` originally showed MFA/OTP screens, but MFA/OTP has been removed from scope after client alignment. The current implementation uses Supabase email/password login and reset-password flow only.

## Database And Security Rules

### Main Tables

- `admin_profiles`
- `system_settings`
- `residents`
- `document_requests`
- `officials`
- `complaints`
- `announcements`
- `feedback`
- `activity_logs`
- `notifications`

### Public Access Pattern

- Public users may read:
  - `system_settings` row `id = 1`
  - active `officials`
  - published `announcements`
- Public users submit data through RPC functions:
  - `submit_document_request`
  - `track_document_request`
  - `submit_complaint`
  - `submit_feedback`
- Public users may upload complaint attachments only to the `complaint-attachments` bucket using the configured storage policy.
- Public users must not directly browse `residents`, `activity_logs`, or unrestricted request/complaint records.

### Admin Access Pattern

- Authenticated active admins can manage operational tables through RLS policies.
- `admin_profiles` currently supports only the `admin` role enum. Do not generate UI or SQL for staff/sub-admin roles unless the schema is intentionally expanded first.
- User management can update admin display name, role, and status under the current admin policies.

### Audit Logging

The schema contains triggers that write admin mutations to `activity_logs` for core tables. Service-level logs are still needed for actions not covered by triggers, such as login and report generation.

Do not create duplicate activity logs for the same mutation unless there is a clear reason.

## Service Layer Pattern

Use this flow:

```text
Page component -> feature hook -> service module -> Supabase client
```

- Page components own layout and user interactions.
- Hooks own loading, errors, pagination, modal state, and refresh orchestration.
- Services own database/storage/RPC calls.
- `useAuth.ts` owns auth/session state and active-admin checks.

Never call `supabase.from(...)`, `supabase.rpc(...)`, or `supabase.storage...` directly from page components.

## Reference ID Generation

- Admin-created residents may use `src/utils/idGenerator.ts`.
- Public document and complaint submissions use database RPC logic for unique tracking/reference codes.
- Use `BD2-YYYY-XXXX` for residents and document requests.
- Use `BLOTTER-YYYY-XXXX` for complaint references.
- IDs must be non-sequential and collision-checked.

## UI And Theming Guidelines

### Admin Theme

| Element | Tailwind Direction |
|---|---|
| Sidebar | `bg-[#1a1c23]` |
| Sidebar border | `border-[#2a2d35]` |
| Page background | light admin workspace currently used by `AdminLayout` |
| Primary accent | blue buttons and active nav states |
| Danger | red |
| Success | green |
| Warning | yellow |

### Public Theme

| Element | Tailwind Direction |
|---|---|
| Header / hero | blue gradient or `bg-blue-700` / `bg-blue-800` |
| Page background | `bg-blue-50`, `bg-white`, or subtle blue grid/gradient |
| Primary button | `bg-blue-600 hover:bg-blue-700` |
| Card background | white cards with soft shadow and rounded corners |
| Primary text | dark gray / near navy |
| Accent / link | blue |

## Development Guidelines

1. Define TypeScript interfaces or use existing types from `src/types/database.ts` before writing logic that handles data.
2. Keep one focused component per file.
3. Extract reusable stateful logic into `src/hooks/`.
4. Components must call services/hooks, not raw Supabase APIs.
5. Check `src/components/ui/` before creating shared UI primitives.
6. Public pages must use `PublicLayout`.
7. Admin pages must use `AdminLayout`.
8. List pages should use server-side pagination where tables can grow.
9. Keep public pages mobile-first.
10. Prefer named exports.
11. Avoid `any`; use specific types or `unknown` with narrowing.
12. Use ASCII punctuation in code and markdown to avoid mojibake.

## Current Implementation Notes

- Admin portal is mostly connected to Supabase.
- Public service functions already exist, but public pages/routes still need to be built.
- `PublicLayout.tsx` exists and should be cleaned/polished during the public phase.
- Activity Logs and History are intentionally merged into one Activity History page.
- Scheduled announcement auto-publish should be documented in a repo SQL file if it is used in Supabase.

## Assistant Behavior For This Repo

When generating or changing code:

1. Keep changes consistent with `UI.pdf` unless the user asks to change the design.
2. Respect current repo paths and naming instead of using older planned paths.
3. Mention if a requested feature needs a schema change before UI work.
4. For public portal work, build in small phases rather than rushing all pages at once.
5. For admin work, preserve the current route/sidebar structure unless the user requests a redesign.
