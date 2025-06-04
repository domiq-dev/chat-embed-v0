# 📊 Amplitude Analytics Implementation Guide

This document serves as the complete implementation reference for integrating Amplitude analytics into the chat-embed-v0 widget to track avatar chatbot performance metrics.

## 📋 Table of Contents

1. [Business Context & Metrics](#business-context--metrics)
2. [Technical Event Mapping](#technical-event-mapping)
3. [Data Dictionary](#data-dictionary)
4. [Implementation Plan](#implementation-plan)
5. [File Structure & Code Locations](#file-structure--code-locations)
6. [Ready-to-Use Code Snippets](#ready-to-use-code-snippets)
7. [Validation Checklist](#validation-checklist)

---

## 🎯 Business Context & Metrics

### Goal

Track a **real-time avatar chatbot** designed to convert website visitors into **qualified leads**, **tour bookings**, and **captured contacts**.

### 20 Key Performance Metrics

#### 🤝 Unified Engagement Metrics (Avatar + Chat)

1. **Conversation Start Rate**: `Users who responded to avatar / Users who saw avatar * 100`
2. **Typing Response Rate**: `% of users who typed at least once after avatar speaks`
3. **Interaction Depth**: `Average number of messages per session`
4. **Bounce Rate from Avatar**: `Users who viewed avatar but took no action / Users who saw avatar * 100`

#### 🎯 Lead Capture & Conversion Funnel

5. **Contact Capture Rate**: `Contacts Captured / Conversation Starts * 100`
6. **Prequalification Completion Rate**: `Prequalified Leads / Conversation Starts * 100`
7. **Tour Booking Rate (per conversation)**: `Tours Booked / Conversation Starts * 100`
8. **Tour Booking Rate (per contact)**: `Tours Booked / Contacts Captured * 100`

#### 📊 Quality & Funnel Drop Metrics

9. **Valid Contact Rate**: `Valid Contacts / Contacts Captured * 100`
10. **Completion Funnel Rate**: `Users completing contact + qualification + tour / Conversation Starts * 100`
11. **Fallback Trigger Rate**: `Fallback Messages / Total Messages * 100`

#### 🔍 Behavior & Visit Tracking

12. **Time on Site (Before Chat)**: `Average time (seconds) user spends on site before chat starts`
13. **Repeat Visitor Rate**: `Returning Visitors / Total Visitors * 100`

#### 🎮 UI Interaction Events

14. **Button Click Rate (Answer Buttons)**: `Answer Button Clicks / Total Conversations * 100`
15. **"Email Office" Click Rate**: `Email Office Clicks / Total Conversations * 100`
16. **Phone Call Initiation Rate**: `Phone Call Clicks / Total Conversations * 100`

#### 🏠 Tour Type Breakdown

17. **In-Person Tour Rate**: `tour_booked where tour_type="in_person" / all tours`
18. **Self-Guided Tour Rate**: `tour_booked where tour_type="self_guided" / all tours`
19. **Video Tour Rate**: `tour_booked where tour_type="video" / all tours`

#### 🎁 Incentive Tracking

20. **Incentive Acceptance Rate**: `incentive_accepted / incentive_offered * 100`

---

## ⚡ Technical Event Mapping

### Events to Implement (18 total)

| Metric #  | Event Name                                | Trigger Point             | File Location                                  |
| --------- | ----------------------------------------- | ------------------------- | ---------------------------------------------- |
| 1         | `chat_session_started`                    | Widget opens/first render | `useChatLifecycle.ts`                          |
| 2         | `user_message_sent`                       | User sends message        | `useChatLifecycle.ts → chatSdk.on('userSend')` |
| 3         | `bot_message_received`                    | Bot reply arrives         | `useChatLifecycle.ts → chatSdk.on('botReply')` |
| 5,9       | `contact_captured`                        | Form submit success       | `ContactForm.tsx`                              |
| 7,8,17-19 | `tour_booked`                             | Booking confirmation      | `TourModal.tsx`                                |
| 11        | `fallback_occurred`                       | Chat fallback/error       | `useChatLifecycle.ts → chatSdk.on('fallback')` |
| 14        | `answer_button_clicked`                   | Quick-reply click         | `QuickReplyButtons.tsx`                        |
| 15        | `email_office_clicked`                    | Email CTA click           | `CTAButtons.tsx`                               |
| 16        | `phone_call_clicked`                      | Phone link click          | `CTAButtons.tsx`                               |
| 20        | `incentive_offered`, `incentive_accepted` | Banner display/click      | `useChatLifecycle.ts`                          |

### Amplitude Chart Configurations

| Metric                  | Chart Type         | Formula                                                              | Grouping     |
| ----------------------- | ------------------ | -------------------------------------------------------------------- | ------------ |
| Conversation Start Rate | Event Segmentation | `count(chat_session_started) / count(Page View)`                     | Daily        |
| Typing Response Rate    | Funnel             | `chat_session_started → user_message_sent`                           | Conversion % |
| Interaction Depth       | Event Segmentation | `avg(user_message_sent + bot_message_received)`                      | By Session   |
| Contact Capture Rate    | Funnel             | `chat_session_started → contact_captured`                            | Conversion % |
| Tour Booking Rate       | Funnel             | `chat_session_started → tour_booked`                                 | Conversion % |
| Valid Contact Rate      | Formula            | `count(contact_captured where valid=true) / count(contact_captured)` | Percentage   |

---

## 📚 Data Dictionary

### Core Identity Fields

| Field        | Scope              | Example                          | When Set         | Purpose                                      |
| ------------ | ------------------ | -------------------------------- | ---------------- | -------------------------------------------- |
| `device_id`  | Frontend & Backend | `A3F24E1D-D0...`                 | After SDK init   | Anonymous identity, repeat-visitor detection |
| `session_id` | Frontend & Backend | `17170001234556`                 | Generated by SDK | Groups events in one chat session            |
| `page_url`   | Frontend only      | `https://grand-oaks.com/leasing` | Widget load      | Source attribution                           |

### Event Properties

| Property                   | Events                                       | Example                               | Purpose                              |
| -------------------------- | -------------------------------------------- | ------------------------------------- | ------------------------------------ |
| `text_len`                 | `user_message_sent`                          | `72`                                  | Interaction depth analysis           |
| `contact_method`           | `contact_captured`                           | `email` / `phone`                     | Split capture rates by method        |
| `valid`                    | `contact_captured`                           | `true` / `false`                      | Valid-contact rate calculation       |
| `option_id`, `option_text` | `answer_button_clicked`                      | `faq-amenities`, `"What amenities?"`  | Analyze popular suggestions          |
| `reason`                   | `fallback_occurred`                          | `no_match` / `error`                  | Debug model gaps                     |
| `incentive_type`           | `incentive_*`                                | `waive_app_fee`                       | Acceptance vs offer rates            |
| `tour_type`                | `tour_booked`                                | `in_person` / `self_guided` / `video` | Tour preference breakdown            |
| `source`                   | `tour_booked`                                | `widget`                              | Distinguish widget vs admin bookings |
| `cta_location`             | `email_office_clicked`, `phone_call_clicked` | `header` / `footer`                   | CTA placement effectiveness          |
| `converted`                | `chat_ended`                                 | `true` / `false`                      | Completion funnel analysis           |
| `chat_start_ts`            | `chat_session_started`                       | Unix timestamp                        | Time-on-site calculation             |

### Backend Header Mapping

```
HTTP Header → BaseEvent Field
x-device-id → device_id
x-session-id → session_id
x-user-id (optional) → user_id
```

---

## 🚀 Implementation Plan

### Phase 1: Core Analytics Setup ✅ COMPLETE

- [x] Create `src/lib/analytics.ts` with Amplitude SDK
- [x] Import analytics in `src/app/layout.tsx`
- [x] Create `src/hooks/useChatLifecycle.ts`
- [x] Add environment variable for `NEXT_PUBLIC_AMPLITUDE_KEY`

### Phase 2: Chat Event Tracking ✅ COMPLETE

- [x] Integrate `useChatLifecycle` in `ChatModal.tsx`
- [x] Track `user_message_sent` in sendMessage function
- [x] Track `bot_message_received` in message handlers (both AKOOL and backend)
- [x] Track `email_office_clicked` in ChatHeader
- [x] Track `chat_session_started` automatically on widget mount

### Phase 3: UI Component Tracking ⚠️ PARTIALLY COMPLETE

- [x] Add tracking to `QuickReplyButtons.tsx` for answer button clicks
- [ ] Create/update `ContactForm.tsx` with contact capture tracking
- [ ] Create/update `TourModal.tsx` with tour booking tracking
- [ ] Create/update CTA components for email/phone tracking

### Phase 4: Backend Integration ❌ NOT STARTED

- [ ] Add backend analytics helper (`analytics.py`)
- [ ] Update `main.py` with analytics initialization
- [ ] Add prequalification events to `tools/prequal_tool.py`

### Phase 5: Testing & Validation ❌ NOT STARTED

- [ ] Test all 18 events in Amplitude Live View
- [ ] Verify proper session/device ID stitching
- [ ] Validate funnel flows work correctly

---

## 📁 File Structure & Code Locations

### Frontend Files (chat-embed-v0/)

```
src/
├── lib/
│   └── analytics.ts                    # ✅ Amplitude SDK setup & helpers
├── hooks/
│   └── useChatLifecycle.ts            # ✅ Central event tracking hook
├── app/
│   └── layout.tsx                     # ✅ Early analytics import
├── components/
│   ├── ChatModal.tsx                  # ✅ Main chat integration
│   └── ui/
│       ├── QuicklyReplyButtons.tsx    # ✅ Answer button tracking
│       ├── ContactForm.tsx            # ❌ Need to create/update
│       ├── TourModal.tsx              # ❌ Need to create/update
│       └── CTAButtons.tsx             # ❌ Need to create/update
└── .env.local                         # ❌ Need NEXT_PUBLIC_AMPLITUDE_KEY
```

### Backend Files (ava-leasing-chatbot/)

```
├── analytics.py                       # ❌ Need to create
├── main.py                           # ❌ Need startup hook
└── tools/
    └── prequal_tool.py               # ❌ Need backend events
```

---

## 💻 Ready-to-Use Code Snippets

### Backend Analytics Helper (analytics.py)

```python
import os
from amplitude import Amplitude, BaseEvent

_client: Amplitude | None = None

def init_analytics() -> None:
    """Create global Amplitude client once."""
    global _client
    if _client is None:
        _client = Amplitude(os.getenv("AMPLITUDE_API_KEY"))

def track(user_id: str, event_type: str, props=None, *, device_id=None, session_id=None):
    if _client is None:
        init_analytics()

    _client.track(
        BaseEvent(
            event_type=event_type,
            user_id=user_id,
            device_id=device_id,
            session_id=session_id,
            event_properties=props or {},
        )
    )
```

### Backend Main.py Integration

```python
from analytics import init_analytics

@app.on_event("startup")
async def startup():
    init_analytics()  # Create Amplitude client
```

### Backend Prequalification Events

```python
from analytics import track

def begin_prequalification(user_id, session_id):
    # existing logic...
    track(user_id, "prequalification_started", {"session_id": session_id}, session_id=session_id)

def complete_prequalification(user_id, session_id, passed: bool):
    # existing logic...
    track(user_id, "prequalification_completed", {"session_id": session_id, "passed": passed}, session_id=session_id)
```

### Contact Form Template

```tsx
// ContactForm.tsx
import { analytics } from '@/lib/analytics';

const ContactForm = ({ onSubmit }) => {
  const handleSubmit = (formData) => {
    // Validate contact info
    const isValid = validateContact(formData);

    // Track contact capture
    analytics.trackContactCapture(
      formData.method, // 'email' or 'phone'
      isValid,
    );

    // Submit form
    onSubmit(formData);
  };

  // ... rest of component
};
```

### Tour Modal Template

```tsx
// TourModal.tsx
import { analytics } from '@/lib/analytics';

const TourModal = ({ onBookTour }) => {
  const handleTourBook = (tourType) => {
    // Track tour booking
    analytics.trackTourBooked(tourType); // 'in_person', 'self_guided', 'video'

    // Complete booking
    onBookTour(tourType);
  };

  // ... rest of component
};
```

---

## ✅ Validation Checklist

### Development Testing

- [ ] All 18 events appear in Amplitude Live View
- [ ] Device ID and Session ID are consistent across events
- [ ] Properties are correctly attached to each event
- [ ] Funnels work end-to-end (chat → contact → tour)

### Event Verification

- [ ] `chat_session_started` fires on widget mount
- [ ] `user_message_sent` tracks message length
- [ ] `bot_message_received` fires for both AKOOL and backend responses
- [ ] `answer_button_clicked` includes option ID and text
- [ ] `contact_captured` includes method and validation status
- [ ] `tour_booked` includes tour type and source
- [ ] `email_office_clicked` / `phone_call_clicked` include CTA location
- [ ] `fallback_occurred` includes reason
- [ ] Backend prequalification events fire correctly

### Amplitude Dashboard Setup

- [ ] All 20 metrics configured as charts/funnels
- [ ] Proper segmentation by device, session, and user properties
- [ ] Custom properties are available for filtering
- [ ] Retention and user journey funnels work correctly

### Production Readiness

- [ ] Environment variables configured
- [ ] Error handling for missing API keys
- [ ] Analytics disabled gracefully when key missing
- [ ] No console errors or warnings
- [ ] Performance impact minimal

---

## 🔗 Quick Reference Links

- **Amplitude Dashboard**: [amplitude.com](https://amplitude.com)
- **Implementation Docs**: This file (`docs/amplitude-implementation-guide.md`)
- **Core Analytics File**: `src/lib/analytics.ts`
- **Main Hook**: `src/hooks/useChatLifecycle.ts`
- **Environment Config**: `env.amplitude.example`

---

_Last Updated: December 2024_  
_Implementation Status: Phase 2 Complete, Phase 3 Partially Complete_

## 📊 Current Implementation Status

### ✅ What's Working (8/18 events):

1. `chat_session_started` - Automatically fires on widget mount
2. `user_message_sent` - Tracks when user sends message (with text length)
3. `bot_message_received` - Tracks both AKOOL avatar and backend responses
4. `email_office_clicked` - Tracks email button clicks in header
5. `answer_button_clicked` - Tracks quick-reply button selections (all types)

### ⚠️ Partially Implemented:

- **Analytics Infrastructure**: Complete and robust
- **Core Chat Events**: Fully tracked
- **UI Event Framework**: Ready for contact/tour components

### ❌ Next Priority (10/18 events):

6. `contact_captured` - Need ContactForm component
7. `tour_booked` - Need TourModal component
8. `phone_call_clicked` - Need phone CTA tracking
9. `fallback_occurred` - Hook exists, need chatSdk integration
10. `incentive_offered/accepted` - Hook exists, need banner integration
    11-14. Backend events (`prequalification_*`) - Need backend integration

### 🎯 Immediate Next Steps:

1. Find or create ContactForm and add `trackContactCapture()`
2. Find or create TourModal and add `trackTourBooked()`
3. Add phone click tracking to CTAs
4. Set up Amplitude dashboard to test current events
5. Add environment variable with real Amplitude API key
