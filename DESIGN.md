# Project Duo Design System

## Direction

Project Duo feels like a premium editorial card game set on a real table at the start of an evening. It is warm and intimate without becoming vintage craft, clinical wellness, or neon nightlife. The signature is a pair of overlapping cards: one coral, one violet, always suggesting two perspectives meeting rather than a generic heart.

## Usage scene

Two or more people use one phone in mixed ambient light—a sofa, café, date-night table, or trip. The interface stays calm enough to disappear once a question is dealt. Light mode uses a warm canvas for daytime and bright rooms; dark mode uses plum-black surfaces for evenings without pure black glare.

## Color roles

| Role           | Light     | Dark      | Purpose                          |
| -------------- | --------- | --------- | -------------------------------- |
| Canvas         | `#FFF9F4` | `#121015` | App background                   |
| Surface        | `#FFFFFF` | `#1D1922` | Cards and controls               |
| Raised surface | `#FFFDFB` | `#28212E` | Sheets and tonal actions         |
| Ink            | `#1C1720` | `#FFF8F2` | Primary content                  |
| Muted ink      | `#756C79` | `#B9AFBC` | Supporting content               |
| Primary        | `#7357E8` | `#9B86FF` | Main action and selection        |
| Coral          | `#F25F70` | `#FF7685` | Social energy and card layering  |
| Gold           | `#E9A83B` | `#FFC45C` | Premium state only               |
| Mint           | `#2FB89D` | `#54D8BC` | Success and trust                |
| Danger         | `#C63D4F` | `#FF6A79` | Destructive and error states     |
| Outline        | `#E8DFE7` | `#3A3240` | Boundaries without ghost shadows |

Category colors supplement labels and never carry meaning alone. Gradients, purple glows, and pure-black drop shadows are excluded.

## Typography

The native system face carries body and controls so Arabic, CJK, dynamic type, and platform expectations remain reliable. Latin display moments use the closest licensed Manrope-like system weight until the final font asset is selected. Roles and metrics live in `src/design/typography.ts`; screens do not invent sizes. Text scales to 200%, questions never use line clamps, and long content grows or scrolls instead of clipping.

## Shape and spacing

- 4 pt base grid; primary spacing increments are 8 pt.
- Cards: 28 pt radius.
- Buttons: 16 pt radius and 56 pt height.
- Chips: pill radius and 44 pt minimum height.
- Icon controls: 48 pt square to satisfy both platforms.
- Main screens: 20 pt horizontal inset, 720 pt maximum content width on large web/tablet previews.

Cards use either an outline or a tinted offset shadow. Pills are reserved for compact choices; content does not live in nested cards.

## Component language

- `AppScreen` owns safe areas, scrolling, keyboard behavior, and page width.
- `AppText` owns type roles, semantic tones, and font scaling.
- `AppButton` owns action hierarchy and loading/disabled accessibility states.
- `IconButton` requires a human-readable label and expands its hit area.
- `Chip` is a choice control with a programmatic selected state.
- The overlapping `BrandMark` is decorative; its surrounding product name carries the accessible identity.

## Motion

Motion is tactile and brief: 160–220 ms for controls, approximately 220 ms plus an 8 pt lift for dealt cards. The native navigation stack keeps platform transitions and predictive back behavior. Reduced Motion replaces spring, rotation, and large movement with a fade or immediate state change.

## Responsive and platform behavior

The product uses stack navigation on all platforms. iOS preserves safe areas, Dynamic Type, and edge-swipe back. Android preserves edge-to-edge insets, 48 dp targets, predictive Back, and Material state semantics. Layouts collapse below 380 pt by reducing display size and card padding while keeping the primary action visible and full width.

## Accessibility floor

Body contrast is at least 4.5:1 and large text at least 3:1. Gestures always have buttons. Selected, loading, busy, and disabled states are announced. Question cards expose one coherent reading label. RTL uses logical start/end layout in feature work; direction-sensitive icons mirror while hearts, stars, and artwork do not.
