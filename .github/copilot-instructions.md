# GitHub Copilot Instructions – BarangayHub (BMIS)

## Project Overview

**BarangayHub** is a full-stack Barangay Management Information System (BMIS) for Barangay Daine II. It digitizes resident records, document requests, blotter/complaint reports, and announcements — replacing manual logbooks with a secure, automated digital platform accessible to both barangay staff and residents.

**Critical Requirements:**

- **Dual-Aesthetic System:** Strict charcoal theme for the Admin Portal and blue theme for the Public Resident Portal.
- **Audit Logging:** Every admin action must be recorded in an immutable `activity_logs` table.
- **Reference ID Format:** Resident tracking codes follow `BD2-YYYY-XXXX` (non-sequential, unique).
- **Performance:** Optimized for 4,800+ resident records via server-side filtering and pagination.
- **Mobile-First Public Portal:** The resident-facing UI must be fully responsive with a hamburger navigation on mobile.

---

## Tech Stack

### Frontend

| Tool | Version |
|---|---|
| React | 19.x |
| TypeScript | 6.x (strict mode) |
| Vite | 8.x (`@vitejs/plugin-react`) |
| Tailwind CSS | Latest |
| Lucide React | Latest |

### Backend / Database

- **Supabase** (PostgreSQL)
  - **Auth:** Email-based admin login with MFA (Multi-Factor Authentication).
  - **RLS (Row-Level Security):** Residents can only access their own requests via Reference ID. Public users have **no** access to `residents` or `activity_logs`.
  - **Realtime:** Enabled for live sidebar badge counts (e.g., pending document requests, new complaints).
  - **Storage:** Used for uploaded attachments on complaint/blotter submissions.

### Code Quality

- **ESLint:** Strict React Hooks + TypeScript rules.
- **Build:** `npm run build` → `tsc -b && vite build`.
- **Prettier:** Consistent formatting with Tailwind CSS class sorting plugin.

---

## Project Structure

```
src/
  components/
    ui/                   # Atomic, reusable elements
      Button.tsx
      Input.tsx
      Badge.tsx
      Table.tsx
      Modal.tsx
      Spinner.tsx
    admin/                # Admin-specific layout components
      Sidebar.tsx
      AdminTopNav.tsx
      ActivityItem.tsx
      StatCard.tsx
    public/               # Resident-facing layout components
      MobileHeader.tsx
      TrackBar.tsx
      AnnouncementCard.tsx

  pages/
    admin/
      Dashboard.tsx         # Analytics: stats, charts, recent activity
      Residents.tsx         # Resident table: CRUD + fuzzy search
      DocumentRequests.tsx  # Request workflow queue
      Announcements.tsx     # Create/manage public announcements
      Complaints.tsx        # Blotter/complaint management
      Feedback.tsx          # View resident feedback & suggestions
      UserManagement.tsx    # Manage admin/staff accounts & roles
      Reports.tsx           # PDF/CSV generation cards
      ActivityLogs.tsx      # Immutable audit trail timeline
      Settings.tsx          # Admin profile, credentials, MFA

    public/
      LandingPage.tsx       # Resident homepage + announcements
      SelectService.tsx     # Service selection landing
      RequestForm.tsx       # Document request submission form
      TrackStatus.tsx       # Reference ID status tracker
      Officials.tsx         # Barangay leadership directory
      Complaints.tsx        # Blotter/concern submission form
      Feedback.tsx          # Resident feedback & suggestions form
      SubmissionSuccess.tsx # Post-submission confirmation + tracking code

  layouts/
    AdminLayout.tsx         # Charcoal sidebar + top nav + content area
    PublicLayout.tsx        # Blue header + mobile-first navigation

  services/
    supabase.ts             # Supabase client initialization (anon key only)
    adminService.ts         # All admin-facing DB queries (residents, requests, logs)
    publicService.ts        # Resident submission logic (requests, complaints, feedback)
    reportService.ts        # PDF/CSV generation helpers

  hooks/
    useAuth.ts              # Admin session management + MFA state
    useStats.ts             # Live badge counts via Supabase Realtime
    useResidents.ts         # Paginated/filtered resident queries
    useRequests.ts          # Document request state management

  types/
    database.ts             # TypeScript interfaces for all DB tables

  utils/
    formatters.ts           # Date, currency, status label helpers
    idGenerator.ts          # BD2-YYYY-XXXX reference ID generation
```

---

## Pages & Features

### Public Portal (Resident-Facing — Blue Theme)

| # | Page / Feature | Description |
|---|---|---|
| 1 | **Landing Page** | Barangay announcements, quick links, officials section. Entry point for residents. |
| 2 | **Select a Service** | Service menu: Request Document, Track Status, Submit Complaint, Feedback. |
| 3 | **Request Form** | Multi-step form for Barangay Clearance, Certificate of Residency, Indigency, etc. Validates all fields before submission. |
| 4 | **Submission Success** | Displays the unique `BD2-YYYY-XXXX` tracking code. Informs resident of estimated processing time. |
| 5 | **Track Request Status** | Input tracking code → displays current workflow status (Pending / Processing / Ready for Pickup / Completed). |
| 6 | **Submit Complaint / Blotter** | Secure form for filing barangay complaints. Supports file attachment. Generates a complaint reference ID. |
| 7 | **Feedback & Suggestions** | Open-ended resident feedback form, anonymous option available. |

### Admin Portal (Barangay Secretary / Staff — Charcoal Theme)

| # | Page / Feature | Description |
|---|---|---|
| 1 | **Admin Login** | Email + password with MFA. Sessions managed via Supabase Auth. |
| 2 | **Dashboard** | Summary stats (total residents, pending requests, open complaints, recent activity). Real-time badge counts. |
| 3 | **Resident Management** | Full CRUD for 4,800+ residents. Fuzzy search by name, purok, voter status. Bulk import via CSV. |
| 4 | **Document Requests** | Process queue with workflow stages: Pending → Processing → Ready for Pickup → Completed. Per-request notes. |
| 5 | **Announcements** | Create, edit, publish, and archive public-facing announcements. Supports rich text and image uploads. |
| 6 | **Complaints / Blotter** | View, assign, and update status of all submitted complaints. Color-coded urgency levels. |
| 7 | **Feedback & Suggestions** | Read-only view of all resident feedback with sentiment tags. |
| 8 | **User Management** | Add/remove admin/staff accounts. Assign roles (Secretary, Staff). Toggle account status. |
| 9 | **Reports** | Generate PDF/CSV reports: Monthly Documents, Census Summary, Complaint Report, Annual Summary. |
| 10 | **Activity Logs & History** | Immutable, color-coded audit trail. Blue: Login. Green: Approval. Red: Rejection/Complaint. Yellow: Edit. |
| 11 | **Settings** | Admin profile, password change, MFA toggle, system preferences. |
| 12 | **Logout** | Secure session termination via Supabase `signOut()`. Redirect to login. |

---

## Database Schema (Key Tables)

```typescript
// src/types/database.ts

export interface Resident {
  id: string;                        // UUID
  reference_id: string;              // BD2-YYYY-XXXX (unique, non-sequential)
  full_name: string;
  birthdate: string;                 // ISO date — UNIQUE with full_name
  address: string;
  purok: string;
  contact_number: string | null;
  is_voter: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentRequest {
  id: string;
  resident_id: string | null;        // FK → residents.id (nullable for walk-ins)
  tracking_code: string;             // BD2-YYYY-XXXX
  document_type: DocumentType;
  status: RequestStatus;
  purpose: string;
  notes: string | null;
  requested_at: string;
  updated_at: string;
}

export type DocumentType =
  | 'barangay_clearance'
  | 'certificate_of_residency'
  | 'certificate_of_indigency'
  | 'business_clearance'
  | 'other';

export type RequestStatus =
  | 'pending'
  | 'processing'
  | 'ready_for_pickup'
  | 'completed'
  | 'rejected';

export interface Complaint {
  id: string;
  reference_id: string;
  complainant_name: string;
  respondent_name: string;
  description: string;
  attachment_url: string | null;
  status: ComplaintStatus;
  urgency: 'low' | 'medium' | 'high';
  submitted_at: string;
  updated_at: string;
}

export type ComplaintStatus =
  | 'open'
  | 'under_review'
  | 'resolved'
  | 'dismissed';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_by: string;               // FK → auth.users.id
  created_at: string;
}

export interface ActivityLog {
  id: string;
  admin_id: string;                 // FK → auth.users.id
  action: string;                   // e.g., "Approved Request BD2-2025-0042"
  entity_type: string;              // e.g., "document_request"
  entity_id: string | null;
  log_type: LogType;
  created_at: string;
}

export type LogType = 'login' | 'approval' | 'rejection' | 'edit' | 'complaint' | 'system';

export interface Feedback {
  id: string;
  message: string;
  is_anonymous: boolean;
  resident_name: string | null;
  submitted_at: string;
}
```

---

## Core Logic & Security Rules

### Reference ID Generation (`src/utils/idGenerator.ts`)

- Format: `BD2-YYYY-XXXX` where `XXXX` is a zero-padded random 4-digit segment.
- Must be **unique** — verify against the database before assigning.
- Must be **non-sequential** to prevent ID enumeration/guessing.

### Service Layer Pattern

- All Supabase queries live in `src/services/`. Components **never** call `supabase.from(...)` directly.
- `adminService.ts` → residents, requests, announcements, complaints (admin operations).
- `publicService.ts` → submissions, tracking lookups (public operations).

### Supabase Security

- Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are used in frontend code.
- **Never** expose `service_role` key in client-side code.
- RLS must be enabled on all tables. Public users may only query `document_requests` and `complaints` by their own `tracking_code` / `reference_id`.
- `activity_logs` and `residents` tables are admin-only at the RLS level.

### Audit Logging Rule

Every admin state change (create, update, delete, approve, reject) must insert a row into `activity_logs` within the same service call. No mutation is complete without its log entry.

---

## UI & Theming Guidelines

### Admin Portal — Charcoal Theme

| Element | Tailwind Class |
|---|---|
| Main background | `bg-[#121417]` |
| Sidebar background | `bg-[#1a1c23]` |
| Card / panel background | `bg-[#1e2028]` |
| Border / divider | `border-[#2a2d35]` |
| Primary text | `text-white` |
| Secondary text | `text-gray-400` |
| Primary accent | `bg-blue-600` / `text-blue-400` |
| Danger / rejection | `text-red-400` |
| Success / approval | `text-green-400` |
| Warning / pending | `text-yellow-400` |

### Public Portal — Blue Theme

| Element | Tailwind Class |
|---|---|
| Header / hero | `bg-blue-700` or `bg-blue-800` |
| Page background | `bg-blue-50` or `bg-white` |
| Primary button | `bg-blue-600 hover:bg-blue-700` |
| Card background | `bg-white shadow-md` |
| Primary text | `text-gray-800` |
| Accent / link | `text-blue-600` |

### Admin Sidebar Structure

Group navigation items using labeled sections:

```
MAIN         → Dashboard
MANAGEMENT   → Residents, Document Requests, Announcements, Complaints, Feedback
ANALYTICS    → Reports, Activity Logs
SYSTEM       → User Management, Settings
             → Logout (bottom, always visible)
```

### Admin Top Nav

- Digital clock (live, updated every second).
- Global search bar.
- MFA status badge.
- Notification bell with real-time count badges.

---

## Development Guidelines

1. **TypeScript First:** Define an `interface` before writing any function that handles data. Never use `any`.

2. **One Component Per File:** Keep files focused. Extract reusable logic into `hooks/`.

3. **Service Layer Only:** Components call service functions; they never write raw Supabase queries.

4. **Layouts Are Mandatory:**
   - Wrap every admin page in `<AdminLayout>`.
   - Wrap every public page in `<PublicLayout>`.

5. **Check Before Creating:** Before writing a new UI component (e.g., a table, a button), check if `src/components/ui/` already has one.

6. **RLS Always On:** When writing a new Supabase table or policy, always apply the principle of least privilege.

7. **Audit Every Mutation:** Every `INSERT`, `UPDATE`, or `DELETE` in `adminService.ts` must be paired with an `activity_logs` insert.

8. **Pagination by Default:** Any list query for `residents` or `document_requests` must use `.range()` for server-side pagination, not client-side filtering of full arrays.

---

## AI Assistant Behaviour

When generating code for this project, Copilot must:

1. **Always define TypeScript interfaces first** before writing any function that touches data from `src/types/database.ts`.

2. **Respect the dual-theme system.** Admin code uses charcoal classes. Public code uses blue classes. Never mix them.

3. **Wrap admin pages in `<AdminLayout>` and public pages in `<PublicLayout>`** automatically.

4. **Check `src/components/ui/`** before generating a new reusable element — prefer extending existing components.

5. **Follow the service layer** — generated components must import from `src/services/`, not call `supabase` directly.

6. **Generate audit log entries** alongside every admin mutation.

7. **Reference ID generation** must use `src/utils/idGenerator.ts`, never inline logic.

8. **Do not use `any`** — if a type is uncertain, use `unknown` and narrow it properly.

9. **Prefer named exports** over default exports for components, hooks, and utilities.

10. **Mobile-first for public pages** — start with mobile layout classes and scale up with `md:` / `lg:` prefixes.
