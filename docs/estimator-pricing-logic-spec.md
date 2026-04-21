# Estimator Pricing Logic Specification
## Client-Side Range Estimator Control Document
## For /assets/js/estimate.js and estimate.html

## 1) Document Status and Scope
This file is a **GitHub project documentation artifact** that defines the required estimator business logic for implementation in `/assets/js/estimate.js` and the estimate form markup. It is **not intended to be stored in Netlify configuration, Netlify functions, or deployment-only locations**.

This specification is authoritative for estimator behavior and exists to prevent assumption-based implementation decisions in Codex prompts.

---

## 2) Estimator Purpose
The estimator provides a **fast, customer-friendly preliminary budget range** for local residential epoxy/coating projects in Charleston, SC and surrounding communities.

Primary outcomes:
- Help homeowners quickly understand expected investment.
- Encourage qualified leads to continue with a call or form submission.
- Offer a clear path to request a formal in-person quote.

The estimator supports the top services:
- Garage coatings
- Porch coatings
- Pool deck coatings

Common reference scenario: **2-car garage projects**.

---

## 3) Quote Boundary Rule (Non-Binding Output)
The estimator must return a **price range only**. It must never produce:
- A fixed final price
- Contract language
- Binding quote language
- Scope guarantee language

Required principle: all outputs are preliminary and subject to on-site verification.

---

## 4) Business Context Constraints (Must Be Applied)
- Service area baseline: within **40 miles of ZIP 29445**.
- Outside standard area: show customer-facing note only that a **small travel fee may apply**.
- Minimum project threshold: **$1,500**.
- Target customer profile: **local residential homeowners**.
- Estimator includes optional photo upload and an option to request in-person quoting follow-up.

---

## 5) Allowed User Inputs (Required Input Model)
The estimator logic must read and validate the following fields:

1. `projectType` (required)
2. `sizeMode` (required; preset or custom)
3. `presetSize` (required when preset mode selected)
4. `customSquareFeet` (required when custom mode selected)
5. `environmentType` (required; indoor/outdoor context)
6. `surfaceCondition` (required)
7. `finishType` (required)
8. `timeline` (required)
9. `zipCode` (required)
10. `name` (required)
11. `phone` (required)
12. `email` (required)
13. `photoUpload` (optional)

Validation requirements:
- Missing required fields must block estimate calculation and show field-level guidance.
- `customSquareFeet` must be numeric and positive.
- `zipCode` must be formatted as 5-digit US ZIP.

---

## 6) Preset Sizing Logic
Preset sizing exists for quick homeowner workflows.

### 6.1 Preset categories
At minimum, include presets for:
- 1-car garage (reference size)
- 2-car garage (primary common reference)
- 3-car garage
- Small porch
- Medium porch
- Large porch
- Small pool deck
- Medium pool deck
- Large pool deck

### 6.2 Preset behavior
- Each preset maps to an internal square-foot value.
- These mapped values are used for range calculations (not displayed as contractor formulas).
- Presets must be editable constants in `estimate.js`, not hard-coded across multiple functions.

---

## 7) Custom Square Footage Logic
When `sizeMode = custom`:
- Use `customSquareFeet` as the base size input.
- Apply the same pricing pipeline as presets.
- Clamp invalid or unrealistic values by validation rules before calculation.

Recommended control behavior:
- Reject values less than or equal to 0.
- Reject non-numeric values.
- Keep high-end guardrails configurable with a named constant.

---

## 8) Project Type Pricing Categories
Project type determines baseline price-per-square-foot bands.

Required categories:
- `garage`
- `porch`
- `pool_deck`

Implementation rule:
- Each project type maps to a low/high base rate pair.
- Base rate pairs must be stored in editable named constants.

---

## 9) Finish Adjustment Categories
Finish selection adjusts both low and high range outputs.

Required category structure:
- `standard`
- `enhanced`
- `premium`

Implementation rule:
- Finish adjustments are multiplicative factors or additive-per-sqft modifiers (choose one method and document inline in code comments).
- Keep finish adjustment table editable in one constants block.

---

## 10) Surface Condition Adjustment Categories
Surface condition reflects prep effort complexity.

Required category structure:
- `good`
- `fair`
- `poor`

Implementation rule:
- Surface condition adjusts range upward according to prep intensity.
- Adjustment values must remain editable constants.

---

## 11) Calculation Pipeline (Order of Operations)
Use this exact logical sequence:

1. Validate required inputs.
2. Resolve square footage from preset or custom mode.
3. Resolve base low/high rates by `projectType`.
4. Apply finish adjustment.
5. Apply surface-condition adjustment.
6. Apply any explicitly defined timeline adjustment (if implemented).
7. Compute preliminary low/high subtotal.
8. Evaluate minimum threshold policy.
9. Format and render customer-facing output copy.
10. Populate hidden form fields for submission logging.

All intermediate calculation values should stay internal and not be shown directly to users.

---

## 12) Minimum Project Threshold Behavior ($1,500)
Policy: minimum project threshold is **$1,500**.

Behavior rule:
- If computed range falls fully below threshold, do not hard-reject.
- Show professional threshold messaging and encourage bundled scope or on-site consultation.
- Continue allowing form submission.

Suggested customer-facing copy standard:
- “Most projects we take on begin at $1,500. Based on your selections, your project may be below our standard minimum. We’re happy to review options and confirm scope with you.”

---

## 13) Travel-Fee Treatment (Message-Only Rule)
Current requirement:
- For ZIP codes inferred outside the standard 40-mile service radius from 29445, show message-only notice:
  - “A small travel fee may apply for projects outside our standard service area.”

Control rule:
- Do **not** automatically add a travel-fee dollar amount into estimator math unless a future revision explicitly defines that logic.

---

## 14) Output Message Rules
Estimator output must include:
1. Estimated range display (low–high).
2. Non-binding disclaimer.
3. Minimum-threshold language when applicable.
4. Travel note when applicable.
5. Clear CTA to request in-person quote.

Display rule:
- Round and format currency for readability (e.g., whole-dollar formatting).

---

## 15) Required Disclaimer Language
The estimator output must include language materially equivalent to:

> “This is a preliminary budget range, not a final or binding quote. Final pricing is confirmed after project review, surface evaluation, and measurements.”

This disclaimer is mandatory in UI output and submission payload (hidden field copy).

---

## 16) Hidden-Field Submission Mapping (Estimate Form)
The form submission must include hidden fields to capture estimator context for lead processing and CRM triage.

Minimum hidden fields:
- `estimate_range_low`
- `estimate_range_high`
- `estimate_range_display`
- `estimate_project_type`
- `estimate_size_mode`
- `estimate_size_value_sqft`
- `estimate_finish_type`
- `estimate_surface_condition`
- `estimate_timeline`
- `estimate_zip`
- `estimate_minimum_threshold_triggered` (boolean-like string)
- `estimate_travel_note_triggered` (boolean-like string)
- `estimate_disclaimer_version`

Implementation notes:
- Hidden fields should be updated immediately after each successful estimate calculation.
- If no valid estimate exists yet, hidden estimate fields should be blank or default-safe values.

---

## 17) Naming Expectations for Constants in /assets/js/estimate.js
Use clear, centralized constant names so business users and future Codex prompts can safely edit logic:

Required naming pattern (or equivalent clarity):
- `MINIMUM_PROJECT_THRESHOLD`
- `SERVICE_AREA_CENTER_ZIP`
- `SERVICE_AREA_RADIUS_MILES`
- `PROJECT_TYPE_RATE_TABLE`
- `PRESET_SIZE_SQFT_TABLE`
- `FINISH_ADJUSTMENT_TABLE`
- `SURFACE_CONDITION_ADJUSTMENT_TABLE`
- `TIMELINE_ADJUSTMENT_TABLE` (if timeline pricing is active)
- `ESTIMATE_DISCLAIMER_TEXT`
- `TRAVEL_FEE_NOTE_TEXT`

Control rule:
- Keep all business-editable tables in one configuration section near top-of-file.

---

## 18) Logic That Must Remain Editable
These elements must remain easy to update without rewriting core functions:
- Project type rate bands.
- Preset size square footage mappings.
- Finish adjustment values.
- Surface-condition adjustment values.
- Timeline adjustment values (if enabled).
- Minimum threshold amount.
- Disclaimer text version.
- Travel note text.
- Service-area radius and reference ZIP.

---

## 19) Logic That Must Not Be Exposed to Customers
The UI must not expose:
- Raw pricing tables.
- Internal adjustment multipliers.
- Internal scoring/weight values.
- Internal validation guardrail constants.
- Internal branching logic used for qualification.

Customer view should only show clean, professional range messaging and qualification notes.

---

## 20) Implementation Compliance Checklist (For Future Codex Prompts)
A future implementation of `/assets/js/estimate.js` is compliant only if:
- It calculates a range, never a fixed quote.
- It supports both preset sizes and custom square footage.
- It uses required input fields and validates them.
- It enforces minimum threshold messaging behavior at $1,500.
- It treats travel-fee language as message-only unless policy changes.
- It includes required disclaimer language.
- It maps hidden fields exactly for form submission traceability.
- It keeps editable business logic in centralized constants.
- It avoids exposing internal pricing formulas to end users.

