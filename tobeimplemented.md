# Features to be Implemented / Re-enabled

This document tracks features, components, and code that have already been built or migrated but are currently hidden, disabled, or stored as legacy code. They are ready to be integrated into the live product as per future requirements.

## 1. Legacy Experiments (Labs)
The legacy laboratory simulations for Computer Networks (CN) and Microprocessors & Microcontrollers (MPMC) have been fully extracted from the `nayi-branch` and securely stored in the current codebase.

**Location:** 
- Frontend components: `frontend/src/legacy_labs/components/simulation/`
- Frontend libraries: `frontend/src/legacy_labs/lib/`
- Backend DB seed: `backend/legacy_labs/migrations/20260604000000_seed_cn_lab.sql`

**Action Required to Implement:**
- Create Next.js route wrappers in `frontend/src/app/(labs)/` that import and render these components.
- Move the `seed_cn_lab.sql` file into `backend/migrations/` and run `cargo sqlx migrate run` to seed the database with the required legacy labs data.

## 2. Testimonials Section (Loved by Students and Faculty)
The Testimonials section on the landing page has been completed but is currently commented out from the main page layout.

**Location:** 
- Component: `frontend/src/components/home/TestimonialsSection.tsx`
- Implementation site: `frontend/src/app/page.tsx`

**Action Required to Implement:**
- Uncomment `{/* <TestimonialsSection /> */}` in `frontend/src/app/page.tsx` to restore the feature to the landing page.

---
*Note: Add new deferred features to this document as they arise.*
