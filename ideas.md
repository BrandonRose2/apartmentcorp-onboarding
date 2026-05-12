# ApartmentCorp Onboarding — Design Brainstorm

<response>
<probability>0.07</probability>
<idea>

**Design Movement:** Corporate Brutalism meets Modern Utility
**Core Principles:**
1. High-contrast, purposeful color blocks — no decorative gradients
2. Bold typographic hierarchy with monospaced accents for task IDs
3. Structural clarity: every element earns its place
4. Tactile checkbox interactions with satisfying feedback

**Color Philosophy:** Deep navy (#0F1C2E) as the primary canvas — authoritative and trustworthy like a property deed. Warm amber (#F59E0B) as the action color — signals urgency and progress. White and light gray for content areas. Avoids the typical "corporate blue gradient" trap.

**Layout Paradigm:** Left-anchored sidebar for phase navigation with a wide content column. No centered hero. The sidebar is always visible on desktop, collapsed to a top rail on mobile.

**Signature Elements:**
1. Phase number badges rendered as large, bold monospaced numerals (e.g., "01", "02")
2. A thick left-border accent on active/in-progress phase cards
3. Progress bar styled as a segmented timeline, not a smooth fill

**Interaction Philosophy:** Every checkbox click triggers a micro-animation (scale + checkmark draw). Completing a phase triggers a brief "phase complete" toast with a distinct sound cue.

**Animation:** Phase cards slide in from the left on load (staggered 60ms). Checkboxes use a 150ms scale(0.95→1) spring. Progress bar segments fill with a 300ms ease-out.

**Typography System:** "DM Mono" for phase numbers and labels; "DM Sans" for body text. Phase headers at 20px/700 weight; task items at 15px/400 weight.

</idea>
</response>

<response>
<probability>0.05</probability>
<idea>

**Design Movement:** Clean Institutional — inspired by government/HR portals but elevated
**Core Principles:**
1. Extreme legibility — every task item is scannable at a glance
2. Warm off-white backgrounds to reduce eye strain over long sessions
3. Color-coded phases (each phase has its own accent hue)
4. Generous vertical rhythm and padding

**Color Philosophy:** Warm white (#FAFAF8) background. Four distinct phase colors: Teal for Pre-Arrival, Blue for Core Training, Indigo for Role-Specific, and Green for Integration. Neutral charcoal (#2D2D2D) for text.

**Layout Paradigm:** Full-width single column with a sticky top progress bar. Phases stack vertically. Each phase header is a full-width colored band. No sidebar.

**Signature Elements:**
1. Color-coded phase headers that span the full width
2. Sub-section dividers styled as thin horizontal rules with a label
3. "Required" vs "Optional" tags on each task item

**Interaction Philosophy:** Hover states reveal a subtle background highlight on each task row. Completed items get a strikethrough with reduced opacity.

**Animation:** Accordion expand/collapse uses a smooth 200ms height transition. Completed tasks fade to 60% opacity with a 250ms transition.

**Typography System:** "Lato" for all text. Phase headers at 18px/700; task text at 14px/400; sub-section labels at 11px/600 uppercase tracked.

</idea>
</response>

<response>
<probability>0.06</probability>
<idea>

**Design Movement:** Warm Professional — Real Estate Brand Aesthetic
**Core Principles:**
1. Feels like an ApartmentCorp brand asset, not a generic HR tool
2. Warm neutrals and terracotta accents evoke residential warmth
3. Card-based layout with soft shadows for depth
4. Clear visual hierarchy between phases, sections, and tasks

**Color Philosophy:** Cream (#FFFBF5) background. ApartmentCorp brand navy (#1A3A5C) for headers and primary actions. Terracotta/rust (#C0622A) as the accent for progress and highlights. Soft sand (#F0E8DC) for card backgrounds.

**Layout Paradigm:** Two-column layout on desktop: left column (30%) shows a sticky phase overview/navigation panel; right column (70%) shows the active phase content. On mobile, collapses to single column with a horizontal phase stepper at top.

**Signature Elements:**
1. Phase overview panel with a vertical stepper showing completion status
2. Document upload cards styled as "file folders" with a tab at the top
3. A "Welcome Banner" at the top with the new hire's name (editable) and start date

**Interaction Philosophy:** Smooth transitions between phases. File upload zones have a dashed border that animates to solid on hover. Completing all tasks in a phase triggers a congratulatory banner.

**Animation:** Phase transitions use a 250ms slide-right animation. Checkboxes use a custom SVG checkmark draw animation (200ms). File drop zones pulse gently when a file is dragged over them.

**Typography System:** "Playfair Display" for phase titles (elegant, residential feel); "Source Sans Pro" for all body/task text. Phase titles at 22px/700; task text at 14px/400.

</idea>
</response>

## Selected Design: Warm Professional (Response 3)

This design philosophy was chosen because it best reflects ApartmentCorp's identity as a residential property company. The warm neutrals and terracotta accents create a welcoming environment for new hires, while the two-column layout with a sticky phase navigator mirrors the functional clarity of the EDD reference tool. The "file folder" aesthetic for the document sorter is particularly fitting for an onboarding context where document collection is central.
