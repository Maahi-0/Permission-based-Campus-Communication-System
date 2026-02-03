# Campus Connect – Centralized Club & Event Communication Platform

Campus Connect is a role-based campus communication system designed to solve the problem of missed seminars, tech sessions, and community events due to fragmented communication channels.  
It provides a single source of truth where verified clubs can publish events and students receive reliable, timely updates without depending on word-of-mouth or social media noise.

This is **not** a simple event listing app. It focuses on verification, ownership, and guaranteed information delivery.

---

## 🚨 Problem Statement

In college communities, important events such as seminars, workshops, and tech sessions are often missed by students because information is scattered across WhatsApp groups, Instagram posts, and informal communication.  
Clubs lack a verified, centralized platform to publish events, and students have no reliable way to track upcoming activities across multiple communities.  
Campus Connect solves this by providing a secure, role-based system where verified clubs publish events and students receive structured notifications from trusted sources.

---

## 🎯 Core Objectives

- Centralize all campus clubs and events in one platform
- Ensure only verified clubs can publish events
- Provide role-based access and accountability
- Guarantee event visibility and notifications to interested students
- Reduce dependency on informal communication channels

---

## 🧩 User Roles

- **Admin**
  - Verifies clubs
  - Manages platform-level access
  - Monitors audit logs

- **Club Lead**
  - Manages club profile
  - Creates and publishes events
  - Cancels or updates events

- **Student**
  - Browses clubs and events
  - Subscribes to clubs
  - Receives notifications

---

## ⚙️ MVP Features (Locked Scope)

- User authentication (email-based)
- Club registration with admin verification
- Role-based access control (RBAC)
- Event lifecycle management:
  - Draft
  - Published
  - Cancelled
- Club subscription system for students
- Notification system for event publish/cancel actions
- Audit logs for event updates

Anything outside this scope is intentionally excluded from v1.

---

## 🏗️ Tech Stack

- **Frontend & Backend**: Next.js (App Router)
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Authorization**: Supabase Row Level Security (RLS)
- **Deployment**: Vercel
- **Styling**: Tailwind CSS

---

## 🔐 Security & Access Control

- Row Level Security (RLS) enabled on all tables
- Server-side authorization for all mutations
- Students cannot modify club or event data
- Only verified clubs can publish events
- All critical actions are logged

This project treats security as a feature, not an afterthought.

---

## 🗄️ Database Overview

Core tables:
- `users`
- `clubs`
- `club_members`
- `events`
- `subscriptions`
- `notifications`
- `audit_logs`

All relationships are enforced at the database level.

---

## 🚀 Application Flow

1. User registers and logs in
2. Club Lead registers a club (status: pending)
3. Admin verifies the club
4. Club Lead creates events (draft)
5. Event is published
6. Subscribed students receive notifications
7. Any update or cancellation is logged and notified

---

