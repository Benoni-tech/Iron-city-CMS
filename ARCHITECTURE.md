# Iron City Church of Christ — Architecture Document

**Version:** 1.0
**Date:** May 2026
**Status:** Approved — ready for implementation

---

## Identity

- **Church name:** Iron City Church of Christ
- **Logo:** To be designed — wordmark approach, no icon
- **Brand colours:** To be determined — architecture uses placeholder tokens
- **Domain:** To be secured — develop on Vercel preview URL
- **Tagline:** To be confirmed with church leadership

---

## Problem statement

Iron City Church of Christ needs two things built as one system: a public-facing website that communicates the church's identity, programmes, sermons, and contact information; and an internal management dashboard used by church staff to manage four membership categories, track weekly attendance across multiple services, record finances, and publish content. The two sides share one codebase and one deployment. The public sees the website. Staff log into `/admin` to manage everything behind it.

---

## Membership categories

```
Lambs          Age 4–10        children with guardian records
Teens          Age 11–16       children with guardian records + personal phone
Youth          SHS/University  young adults, personal records only
Congregation   Married adults  full adult records
```

Family linking: when a child (Lamb or Teen) is registered, their guardian records are cross-referenced against existing adult members (Youth or Congregation). If a match is found by name or phone number, the system suggests linking. A linked family tree shows: parent → children attending. This enables the query "children of members who have not been seen in 3+ weeks."

---

## Tech stack

| Concern | Decision | Reason |
|---|---|---|
| Framework | Next.js 15 App Router | ISR for public pages; SSR for admin |
| Auth | Firebase Auth + session cookie | Multi-role with custom claims; same pattern as Subsurface |
| Database | Firestore | Document model suits member profiles, attendance logs, financial records |
| Storage | Firebase Storage | Sermon notes PDFs, event flyers, church photos |
| Charts | Recharts | Attendance and financial charts in dashboard — React-native, no external service |
| Email | Resend | Contact form notifications to church office |
| Styling | Tailwind CSS | Subsurface design language carried over |
| Fonts | Inter (UI) + a serif for headings | Clean and legible; confirmed with brand guide when available |
| Deployment | Vercel | Free tier sufficient for 200-member church at this scale |

---

## Roles and permissions

```
Role             Firebase custom claim    Access
Super Admin      role: "super_admin"      Everything — including financials and user management
Contributor      role: "contributor"      Membership, attendance, programmes, blog — no financials
Viewer           role: "viewer"           Read-only — dashboard stats and reports only, no editing
```

Middleware protects `/admin/:path*`. Financial routes (`/admin/finance/*`) check for `super_admin` specifically — contributor and viewer cannot access them even if they guess the URL.

Three people will have Super Admin access (treasurer + 2 others). Contributors handle day-to-day membership and attendance. Viewers are leadership who want to see reports without editing anything.

---

## Firestore data model

### Member collections

All four membership types share a similar base structure but have different fields. They are separate collections — not a single `members` collection with a type field — because their schemas are meaningfully different and queries never cross-pollinate.

#### `lambs` — children age 4–10

```
lambs/{id}

Personal (Section 1 — Ward Information)
  firstName           string
  surname             string
  otherName           string
  dateOfBirth         string      YYYY-MM-DD
  gender              string      "male" | "female"
  grade               string      e.g. "Primary 3"
  schoolName          string
  memberStatus        string      "active" | "inactive" | "transferred" | "deceased"
  photoUrl            string      Firebase Storage URL — optional
  joinedAt            timestamp

Guardian 1 (Section 2)
  g1FirstName         string
  g1LastName          string
  g1OtherName         string
  g1DateOfBirth       string
  g1Relationship      string      "father" | "mother" | "uncle" | "aunt" | "other"
  g1Phone             string
  g1HomeAddress       string
  g1MemberId          string      optional — links to adult member document if found

Guardian 2 (Section 3)
  g2FirstName         string
  g2LastName          string
  g2OtherName         string
  g2DateOfBirth       string
  g2Relationship      string
  g2Phone             string
  g2HomeAddress       string
  g2MemberId          string      optional

  updatedAt           timestamp
  createdAt           timestamp
```

#### `teens` — children age 11–16

Same structure as `lambs` plus:
```
  personalPhone       string      teen's own phone number — optional
```

#### `youth` — SHS and university students

```
youth/{id}

Section 1 — Personal Information
  firstName           string
  surname             string
  otherName           string
  dateOfBirth         string
  gender              string
  educationLevel      string      "SHS" | "University" | "Other"
  schoolName          string
  yearGroup           string      e.g. "Year 2", "Form 3"
  phone               string
  homeAddress         string
  memberStatus        string      "active" | "inactive" | "transferred" | "deceased"
  photoUrl            string
  joinedAt            timestamp

Section 2 — Parent / Guardian 1
  g1FirstName         string
  g1LastName          string
  g1OtherName         string
  g1DateOfBirth       string
  g1Relationship      string
  g1Phone             string
  g1HomeAddress       string
  g1MemberId          string      optional link

Section 3 — Parent / Guardian 2
  (same as g1 fields)
  g2MemberId          string

  updatedAt           timestamp
  createdAt           timestamp
```

#### `congregation` — married adults and main church body

```
congregation/{id}

Section 1 — Personal Information
  firstName           string
  surname             string
  otherName           string
  dateOfBirth         string
  gender              string
  maritalStatus       string      "single" | "married" | "widowed" | "divorced"
  occupation          string
  phone               string
  alternatePhone      string
  homeAddress         string
  email               string      optional
  memberStatus        string      "active" | "inactive" | "transferred" | "deceased"
  baptismDate         string      optional — YYYY-MM-DD
  photoUrl            string
  joinedAt            timestamp

Section 2 — Spouse (if married)
  spouseFirstName     string
  spouseLastName      string
  spousePhone         string
  spouseMemberId      string      optional link to their own congregation record

Section 3 — Emergency Contact
  emergencyName       string
  emergencyRelation   string
  emergencyPhone      string

  updatedAt           timestamp
  createdAt           timestamp
```

---

### Attendance

Attendance is recorded per service session. A service session is one event (e.g. Sunday Morning 18 May 2025). Each session has individual attendance records.

#### `service_sessions`

```
service_sessions/{sessionId}

serviceType         string      "sunday_morning" | "sunday_evening" | "monday_bible" | "wednesday_prayer" | "special"
date                string      YYYY-MM-DD
title               string      optional — e.g. "Easter Sunday" for special services
notes               string      optional
conductedBy         string      preacher/leader name
totalPresent        number      cached count — updated when attendance is marked
createdBy           string      UID of staff member who created the session
createdAt           timestamp
```

#### `attendance_records`

```
attendance_records/{recordId}

sessionId           string      → service_sessions — indexed
memberId            string      the member's Firestore document ID — indexed
memberCategory      string      "lambs" | "teens" | "youth" | "congregation"
memberName          string      denormalised — stored so queries don't need member lookup
present             boolean
markedAt            timestamp
markedBy            string      UID of staff member
```

**Indexes required:**
- `sessionId` + `memberCategory` — for marking attendance per session
- `memberId` + `sessionId` — for individual member attendance history
- `memberId` + `markedAt desc` — for "last seen" queries
- `present` + `memberCategory` + `markedAt desc` — for absence detection

**Absence detection query:**
To find members who have missed 3 consecutive Sundays:
1. Get all Sunday morning sessions in the last 3 weeks
2. For each member, check if they have `present: true` in any of those 3 sessions
3. Members with zero `present: true` records across all 3 sessions are flagged as absent

This runs as a scheduled function or on-demand from the admin dashboard.

---

### Financial records

Financial data is only readable by `super_admin` role. The API routes check the role server-side — not just the middleware.

#### `financial_records`

```
financial_records/{recordId}

type                string      "income" | "expenditure"
category            string
  income:           "tithe" | "offering" | "special_collection" | "building_fund" | "missions" | "other"
  expenditure:      "utilities" | "maintenance" | "staff" | "missions_support" | "programmes" | "other"
amount              number      in Ghana Cedis (GHS)
description         string
date                string      YYYY-MM-DD — the service/event date this relates to
serviceSessionId    string      optional — links offering to a specific service
recordedBy          string      UID of the person entering the record
approved            boolean     super admin can approve/verify entries
createdAt           timestamp
updatedAt           timestamp
```

**Indexes required:**
- `type` + `date desc` — income and expenditure lists
- `category` + `type` + `date desc` — category breakdown
- `date` — date range queries for monthly/annual reports
- `serviceSessionId` — linking offering to a service

#### `financial_periods`

Monthly summary snapshots — generated when an admin closes a month.

```
financial_periods/{periodId}

year                number
month               number      1–12
totalIncome         number
totalExpenditure    number
netBalance          number
incomeBreakdown     object      {tithe: n, offering: n, special: n, building: n, missions: n}
expenditureBreakdown object     {utilities: n, maintenance: n, ...}
closedAt            timestamp
closedBy            string      UID
```

---

### Content collections

#### `programmes`

```
programmes/{id}

title               string
date                string      YYYY-MM-DD
endDate             string      optional — for multi-day events
time                string      e.g. "9:00 AM"
location            string
description         string      plain text
category            string      "sunday_service" | "prayer" | "bible_study" | "special" | "annual"
flyer               string      Firebase Storage URL — optional
publishedOnSite     boolean     whether it shows on public /events page
status              string      "upcoming" | "ongoing" | "past"
createdAt           timestamp
```

#### `sermons`

```
sermons/{id}

title               string
speaker             string
series              string      optional — sermon series name
date                string      YYYY-MM-DD
scripture           string      e.g. "John 3:16"
body                object      TipTap JSON — sermon notes / teaching content
tags                string[]
status              string      "draft" | "published"
publishedAt         timestamp
createdAt           timestamp
```

#### `blog_posts`

For general church news, announcements, and non-sermon content.

```
blog_posts/{id}

title               string
slug                string      indexed
excerpt             string
body                object      TipTap JSON
featuredImage       string      Firebase Storage URL
category            string      "news" | "announcement" | "devotional"
status              string      "draft" | "published"
publishedAt         timestamp
createdAt           timestamp
```

---

### Site config

```
site_config/main

churchName          string
tagline             string
phone               string
email               string
address             string
officeHours         string
mapsEmbedUrl        string
aboutHistory        string      TipTap JSON
aboutMission        string      plain text
aboutVision         string      plain text
aboutValues         string[]    array of value strings
aboutBelief         string      TipTap JSON — Statement of Faith
heroHeadline        string
heroSubline         string
heroImageUrl        string
updatedAt           timestamp
```

---

## Route map

### Public website

```
Route                   Rendering     Data source       Notes
/                       ISR 60s       Firestore         Hero, upcoming programmes preview, latest sermon
/about                  ISR 60s       Firestore         History, mission, vision, values, belief
/about/our-story        ISR 60s       Firestore         Church history detail
/about/our-beliefs      ISR 60s       Firestore         Statement of Faith
/about/mission-vision   ISR 60s       Firestore         Mission and vision detail
/sermons                ISR 60s       Firestore         Filterable sermon notes — speaker, date, series
/sermons/[slug]         ISR 60s       Firestore         Individual sermon detail
/events                 ISR 60s       Firestore         Upcoming programmes calendar
/contact                SSG           —                 Static form + map
/api/contact            Route         Resend            POST — contact form notification
```

### Admin dashboard

```
Route                           Access              Notes
/login                          Public              Firebase Auth sign-in
/admin                          All roles           Overall dashboard view
/admin/members                  Contributor+        Overview of all 4 categories
/admin/members/lambs            Contributor+        Lambs list + add + edit
/admin/members/lambs/new        Contributor+        Full Lambs registration form
/admin/members/lambs/[id]       Contributor+        Edit lamb record + family links
/admin/members/teens            Contributor+        Teens list + add + edit
/admin/members/teens/new        Contributor+        Full Teens registration form
/admin/members/teens/[id]       Contributor+        Edit teen record
/admin/members/youth            Contributor+        Youth list + add + edit
/admin/members/youth/new        Contributor+        Youth registration form
/admin/members/youth/[id]       Contributor+        Edit youth record
/admin/members/congregation     Contributor+        Congregation list + add + edit
/admin/members/congregation/new Contributor+        Congregation registration form
/admin/members/congregation/[id] Contributor+       Edit congregation record
/admin/attendance               Contributor+        Attendance overview + session list
/admin/attendance/new           Contributor+        Create service session + mark attendance
/admin/attendance/[sessionId]   Contributor+        View/edit session attendance
/admin/attendance/reports       All roles           Absence reports + graphical views
/admin/finance                  Super Admin only    Financial overview — income + expenditure
/admin/finance/record           Super Admin only    Add income or expenditure entry
/admin/finance/reports          Super Admin only    Monthly/annual charts and summaries
/admin/finance/[period]         Super Admin only    Specific period report
/admin/programmes               Contributor+        List upcoming + past programmes
/admin/programmes/new           Contributor+        Add programme
/admin/programmes/[id]          Contributor+        Edit programme
/admin/sermons                  Contributor+        Sermon list — draft and published
/admin/sermons/new              Contributor+        TipTap editor + sermon metadata
/admin/sermons/[id]             Contributor+        Edit sermon
/admin/blog                     Contributor+        Blog post list
/admin/blog/new                 Contributor+        TipTap editor
/admin/blog/[id]                Contributor+        Edit post
/admin/site-config              Super Admin only    Site copy, contact details, hero content
/admin/users                    Super Admin only    Manage admin accounts and roles
```

---

## File structure

```
app/
  layout.tsx                     root — fonts, nav, footer shell
  page.tsx                       homepage
  globals.css                    design tokens, animations
  about/
    page.tsx
    our-story/page.tsx
    our-beliefs/page.tsx
    mission-vision/page.tsx
  sermons/
    page.tsx
    [slug]/page.tsx
  events/page.tsx
  contact/page.tsx
  login/page.tsx
  admin/
    layout.tsx                   auth guard + role-aware sidebar
    page.tsx                     dashboard overview
    members/
      page.tsx                   4-category overview with counts
      lambs/page.tsx
      lambs/new/page.tsx
      lambs/[id]/page.tsx
      teens/page.tsx
      teens/new/page.tsx
      teens/[id]/page.tsx
      youth/page.tsx
      youth/new/page.tsx
      youth/[id]/page.tsx
      congregation/page.tsx
      congregation/new/page.tsx
      congregation/[id]/page.tsx
    attendance/
      page.tsx
      new/page.tsx
      [sessionId]/page.tsx
      reports/page.tsx
    finance/
      page.tsx
      record/page.tsx
      reports/page.tsx
      [period]/page.tsx
    programmes/
      page.tsx
      new/page.tsx
      [id]/page.tsx
    sermons/
      page.tsx
      new/page.tsx
      [id]/page.tsx
    blog/
      page.tsx
      new/page.tsx
      [id]/page.tsx
    site-config/page.tsx
    users/page.tsx
  api/
    auth/session/route.ts
    auth/signout/route.ts
    contact/route.ts
    admin/
      members/lambs/route.ts
      members/lambs/[id]/route.ts
      members/teens/route.ts
      members/teens/[id]/route.ts
      members/youth/route.ts
      members/youth/[id]/route.ts
      members/congregation/route.ts
      members/congregation/[id]/route.ts
      members/search/route.ts       guardian cross-reference search
      attendance/route.ts
      attendance/[sessionId]/route.ts
      attendance/reports/route.ts
      finance/route.ts              Super Admin check inside handler
      finance/[id]/route.ts
      finance/reports/route.ts
      programmes/route.ts
      programmes/[id]/route.ts
      sermons/route.ts
      sermons/[id]/route.ts
      blog/route.ts
      blog/[id]/route.ts
      site-config/route.ts
      users/route.ts
    revalidate/route.ts

components/
  — public —
  nav.tsx
  footer.tsx
  hero.tsx
  sermon-card.tsx
  event-card.tsx
  contact-form.tsx
  post-body.tsx                  TipTap read-only renderer

  — admin —
  admin-nav.tsx                  role-aware sidebar
  tiptap-editor.tsx
  image-upload.tsx
  sortable-list.tsx
  member-form-lambs.tsx          full 3-section form for Lambs
  member-form-teens.tsx          same + personal phone
  member-form-youth.tsx          full adult form + guardian sections
  member-form-congregation.tsx   full adult form + spouse + emergency
  guardian-link-search.tsx       search existing members to link as guardian
  attendance-sheet.tsx           checkbox grid for marking attendance per session
  absence-report.tsx             table of members absent 3+ consecutive Sundays
  attendance-chart.tsx           Recharts bar/line chart for weekly/monthly/yearly
  finance-chart.tsx              Recharts — income vs expenditure
  family-tree-view.tsx           parent → children relationship display

lib/
  firebase.ts
  firebase-admin.ts
  firestore.ts                   all typed query functions
  auth.ts                        session helpers, role checks
  attendance.ts                  absence detection logic
  finance-reports.ts             monthly summary generation
  resend.ts
  slug.ts
  read-time.ts

types/index.ts
middleware.ts
```

---

## Dashboard overview — what admin sees on `/admin`

The main dashboard is a single page with four areas:

**Membership summary (4 cards)**
```
Lambs        [count]    [active count]
Teens        [count]    [active count]
Youth        [count]    [active count]
Congregation [count]    [active count]
Total        [sum]
```

**Attendance this week**
- Which services happened this week
- Attendance count per service
- Bar chart: this week vs last week vs same week last year

**Recent absences**
- Members flagged as absent 3+ consecutive Sundays
- Sorted by category
- Quick link to their profile

**Upcoming programmes**
- Next 3 events from the programmes collection

**Financial snapshot (Super Admin only — hidden from Contributor and Viewer)**
- This month: total income, total expenditure, net
- Simple bar showing income vs expenditure

---

## Attendance system — how it works

**Creating a session:**
Staff go to `/admin/attendance/new`, select the service type and date, optionally add a title and preacher. This creates a `service_sessions` document.

**Marking attendance:**
The attendance sheet (`attendance-sheet.tsx`) loads all active members grouped by category. Each member has a checkbox. Staff tick who is present. On save, the system writes individual `attendance_records` documents and updates `totalPresent` on the session.

For a church of 200 this is manageable in one page. Categories are tab-separated so the sheet is not overwhelming.

**Absence detection:**
The `/admin/attendance/reports` page runs the absence query on load:
1. Fetches all Sunday morning sessions in the last 3 weeks
2. For each active member, checks their attendance across those sessions
3. Returns members with zero presence — displayed in a table with their contact details
4. Export as CSV for follow-up pastoral visits

**Charts:**
- Weekly view: attendance per service type for the past 8 weeks — line chart
- Monthly view: total monthly attendance per category — stacked bar chart
- Yearly view: month-by-month totals for the current year — area chart

All charts built with Recharts. Data fetched server-side, rendered as Client Components for interactivity.

---

## Family linking system

When registering a child (Lamb or Teen), Section 2 and 3 (guardian fields) include a search button next to the guardian name. Clicking it opens a modal that searches existing Youth and Congregation members by name or phone number.

If a match is found, the staff member can link the guardian to the child record. This stores the guardian's member ID (`g1MemberId`) on the child document.

The family tree view on a parent's profile page shows:
```
[Parent Name]
  └── [Child Name] — Lamb, Age 7
  └── [Child Name] — Teen, Age 13
```

Clicking a child opens their record. Clicking the parent from the child's record does the same.

This also powers a query: "show me all Congregation members whose linked children have not attended in 3+ weeks" — useful for pastoral follow-up conversations.

---

## Financial system

**Income recording:**
Each offering collected at a service links to the service session. Staff enter: category (offering, tithe, etc.), amount, date. If it was collected at a service, they select the session from a dropdown.

**Expenditure recording:**
Category, amount, description, date, optional receipt upload (Firebase Storage).

**Monthly report:**
At the end of each month a Super Admin clicks "Close month." This runs a summary calculation and writes a `financial_periods` document. The period is then locked — individual records can no longer be edited.

**Charts on `/admin/finance`:**
- Income vs expenditure bar chart — last 6 months
- Category breakdown pie chart — this month's income by type
- Category breakdown pie chart — this month's expenditure by type
- Year-to-date totals

All built with Recharts.

---

## Member registration forms

Each category has its own form component. They share a common layout pattern:

```
Section header (Ward Information / Personal Information)
  Fields in 2-column grid on desktop, 1-column on mobile

Section header (Parent / Guardian 1)
  Guardian link search button — searches existing members
  Guardian fields

Section header (Parent / Guardian 2)
  Same as Guardian 1
```

Form state managed with React Hook Form. Validation with Zod on the API route. No inline validation on field blur — validation runs on submit to keep the form fast for data entry.

Photo upload is optional on all forms — ImageUpload component, goes to Firebase Storage.

---

## Public website sections

**Homepage:**
- Hero — church name, tagline, hero image, two CTAs (Visit Us / Our Sermons)
- Upcoming programmes — 3 next events from programmes collection
- Latest sermon — most recent published sermon with scripture reference
- About snippet — one paragraph from site_config.aboutMission + link to /about

**Sermons page:**
- Filter by speaker, series, date range
- Each sermon shows: title, speaker, scripture, date, series badge
- Individual sermon page: full TipTap body (notes), scripture, date, series
- No audio/video in v1 — text notes only

**Events page:**
- All upcoming programmes sorted by date
- Category filter (Sunday service, prayer, Bible study, special)
- Each event: title, date, time, location, description, optional flyer image

**About pages:**
- All content editable from `/admin/site-config` via TipTap
- Our Story: church history
- Our Beliefs: Statement of Faith
- Mission & Vision: mission statement, vision statement, core values

---

## Design direction

Subsurface design language adapted for a church context:

**Palette (provisional — confirm with church leadership):**
```
Primary dark:    #1a2744   deep navy — conveys trust, solidity
Accent:          #c9a84c   warm gold — dignity, light, faith
White:           #ffffff
Off-white:       #f8f7f4   warm background for reading pages
Text:            #1c1917
Muted:           #78716c
```

**The gold accent replaces lime green** — lime green is appropriate for a creative publication but not for a church. Gold reads as dignity and faith across denominational contexts.

**Typography:**
```
Headings:   Playfair Display — editorial, dignified
Body:       Source Serif 4 — readable long-form
UI:         Inter — navigation, labels, admin
```

---

## What is not in v1

- Audio or video sermon hosting
- Online giving / payment integration
- Member portal (members logging in themselves)
- SMS attendance reminders
- WhatsApp integration
- Mobile app
- Multi-campus support
- Visitor tracking (separate from member tracking)
- Small group / cell group management

---

## Build order

1. Firebase project setup — Auth, Firestore indexes, Storage rules
2. Types — all member, attendance, financial, and content interfaces
3. Firebase lib files and auth session pattern
4. Root layout, globals.css, design tokens, public nav and footer
5. Public website pages — homepage, about, sermons, events, contact
6. Admin layout — role-aware sidebar (Super Admin sees Finance, Contributor does not)
7. Admin dashboard overview page
8. Membership forms — Lambs first (most complex with guardian sections), then Teens, Youth, Congregation
9. Member list pages with search and filter
10. Family linking — guardian search modal, family tree view
11. Attendance — session creation, attendance sheet, absence reports, charts
12. Financial system — income/expenditure entry, monthly close, charts (Super Admin only)
13. Programmes admin
14. Sermons and blog admin — TipTap editors
15. Site config admin — editable about pages, hero content
16. User management
17. API routes for all admin operations
18. ISR revalidation for all public pages
19. SEO — metadata per page, JSON-LD (Church schema), sitemap

---

## Open questions — blocking

| Question | Blocks |
|---|---|
| Church tagline | Hero section, site config |
| Brand colour confirmation | Entire design system |
| Domain name | Vercel deployment, email configuration |
| Resend email address for contact form notifications | `/api/contact` route |
| Who is the initial Super Admin account? | Firebase Auth setup |

## Open questions — non-blocking

| Question | Notes |
|---|---|
| Main congregation section — additional fields? | You mentioned sending more details |
| Church service schedule | Needed to seed the service types in the attendance system |
| Annual programme calendar format | Affects how programmes are displayed on public site |
| Financial year start month | Affects annual report period calculations |
