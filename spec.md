# WineApp Specification

A wine tasting journal web application for tracking personal wine collections and tastings.

---

## Overview

WineApp is a personal wine tasting journal that allows users to:
- Scan wine labels to automatically extract wine information
- Track wines in their collection with stock management
- Record tastings with ratings and notes
- View friends' tasting activity (v1.1)
- Export wine lists in restaurant-grade format (v1.1)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Backend/Database | Supabase (Postgres) |
| Authentication | Supabase Auth (email/password only) |
| Image Storage | Supabase Storage |
| Label Recognition | Claude API with vision capabilities |

---

## Release Phases

### v1.0 (MVP)
- Wine collection management
- Tasting journal
- Label scanning via Claude API
- Stock tracking
- Calendar view
- Basic statistics
- Dark mode

### v1.1
- Friend system
- Activity feed
- Wine list export (PDF)
- Data export (CSV/JSON)

---

## Data Model

### Wine

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Yes | Primary key |
| user_id | UUID | Yes | Owner reference |
| name | String | Yes | Wine name |
| producer | String | No | Winery/producer name |
| vintage | Integer | No | Year |
| region | String | No | From predefined list |
| grape_variety | String | No | From predefined list |
| alcohol_percentage | Decimal | No | ABV |
| bottle_size | String | No | e.g., 750ml, 1.5L |
| appellation | String | No | Classification/appellation |
| importer | String | No | Importer name |
| vineyard | String | No | Specific vineyard |
| winemaker_notes | Text | No | Notes from label/producer |
| image_url | String | No | Single label photo |
| stock | Integer | Yes | Default: 1 |
| is_public | Boolean | Yes | Default: false (v1.1) |
| created_at | Timestamp | Yes | Auto-generated |
| updated_at | Timestamp | Yes | Auto-generated |

### Tasting

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Yes | Primary key |
| wine_id | UUID | Yes | Reference to wine |
| user_id | UUID | Yes | Who recorded the tasting |
| rating | Integer | Yes | 1-5 stars |
| notes | Text | No | Freeform tasting notes |
| tasting_date | Date | Yes | When the wine was tasted |
| location | String | No | Where tasted |
| occasion | String | No | Context (dinner party, restaurant, etc.) |
| created_at | Timestamp | Yes | Auto-generated |

**Behavior:**
- Multiple tastings can be linked to the same wine
- Creating a tasting automatically decrements wine stock by 1
- Wine remains visible when stock reaches zero (shown as "out of stock")

### User (v1.1)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Yes | Primary key (Supabase Auth) |
| username | String | Yes | Unique display name |
| email | String | Yes | From Supabase Auth |
| created_at | Timestamp | Yes | Auto-generated |

### Friendship (v1.1)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Yes | Primary key |
| user_id | UUID | Yes | Requester |
| friend_id | UUID | Yes | Recipient |
| status | Enum | Yes | pending, accepted |
| created_at | Timestamp | Yes | Auto-generated |

### Regions and Grape Varieties

- Predefined lists maintained by administrators
- Users select from dropdowns, cannot add custom entries
- Lists should cover major wine regions and common grape varieties

---

## Features

### Wine Label Scanning

**Flow:**
1. User uploads photo via file picker (works on mobile browsers)
2. Image sent to Claude API with prompt to extract wine information
3. Claude returns structured JSON with wine fields
4. App populates form with extracted data
5. User reviews, edits if needed, and saves
6. Image stored in Supabase Storage

**Claude API Integration:**
- Use vision capabilities to analyze label image
- Return structured JSON with all wine fields
- Leave fields blank if information cannot be determined
- No AI-generated guesses for uncertain data

**Error Handling:**
- On failure: show retry button
- After retry fails: offer manual entry form
- Display user-friendly error message

### Manual Wine Entry

- Available as fallback when scanning fails
- Minimal required field: wine name only
- All other fields optional
- Same form used for editing existing wines

### Tasting Entry

**Fields:**
- Wine selection (from user's collection or new wine)
- Rating: 5-star scale (required)
- Notes: freeform text (optional, no AI assistance)
- Date: when tasted (required)
- Location: where tasted (optional)
- Occasion: context/event (optional)

**Behavior:**
- Automatically decrements wine stock by 1
- User can edit all fields of a tasting after saving

### Stock Management

- Default stock: 1 when adding new wine
- Manual adjustment available (+/- buttons)
- Auto-decrement when tasting is recorded
- Wine visible at zero stock with "out of stock" indicator
- No archive/hide functionality

### Home Screen

Three sections:
1. **Activity Feed**: Chronological list of own tastings (v1.0), plus friends' tastings (v1.1)
2. **Calendar**: Month view showing dates with tastings
3. **Stats**: Basic counts only
   - Total wines in collection
   - Average rating
   - Wines tasted this month

### Calendar View

- Month view with indicators on dates with tastings
- Tapping a date with tastings shows quick preview modal
- Modal displays summary cards of that day's tastings
- Tap card to navigate to full tasting detail

### Activity Feed (v1.1)

- Compact list format (not social-media style cards)
- Shows own and friends' tastings
- No interactions (no likes, comments, reactions)
- View-only feed

### Wine Detail Page

- Data-first layout (wine information prominent)
- Label image displayed smaller/secondary
- List of all tastings for this wine
- Stock indicator and adjustment controls
- Edit button for wine information

### Search and Filtering

- Faceted filters:
  - Region
  - Grape variety
  - Rating range
  - Date range
  - Stock status (in stock / out of stock)
- Text search on wine name, producer, notes

### Friend System (v1.1)

- Discovery: search by username or email only
- No contact sync or QR codes
- Simple friend request flow
- All user tastings visible to friends
- Users can mark individual wines as public/private

### Export (v1.1)

**Wine List PDF:**
- Restaurant-grade classic format
- Organized by region/type
- Columns: wine name, producer, vintage
- No pricing information
- Professional layout suitable for printing

**Data Export:**
- CSV format for spreadsheet use
- JSON format for data portability
- Includes all wine and tasting data

---

## UI/UX

### Styling
- Tailwind CSS for utility classes
- shadcn/ui component library
- Clean, minimal aesthetic

### Dark Mode
- Manual toggle in settings
- User preference persisted
- No automatic system detection

### Responsive Design
- Mobile-first approach
- Works well on phone browsers for scanning
- Desktop layout for larger screens

### No Onboarding
- New users land directly on empty home screen
- No tour, prompts, or preference setup

---

## Authentication

- Email/password registration and login only
- No social logins (Google, Apple, etc.)
- No magic links
- Powered by Supabase Auth

---

## Technical Constraints

### Connectivity
- Internet required for label scanning
- Previously loaded data viewable offline
- No offline entry creation

### Scale
- Designed for personal use
- Expected: user + small number of friends
- Collection size: dozens to low hundreds of wines

### Privacy
- No GDPR features in initial release
- No account deletion flow initially
- No notifications (email or push)

---

## Out of Scope

The following are explicitly not included:
- Native mobile apps (web only)
- Wine lists/collections feature
- AI-assisted tasting note writing
- Price tracking or currency support
- Gamification (achievements, streaks)
- Advanced analytics or trends
- Social interactions (likes, comments)
- Push notifications
- Inventory location tracking (cellar positions)
- Drink window recommendations
- Food pairing suggestions
- Wine recommendations
- Integration with external wine databases (Vivino, Wine-Searcher)
