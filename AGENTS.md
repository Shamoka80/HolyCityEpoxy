# Repository Build Instructions

## Project objective
Build a lightweight, static-first marketing website for a local epoxy and concrete coatings business serving Charleston, SC and surrounding areas.

## Required architecture
- Use plain HTML, CSS, and minimal JavaScript.
- Do not introduce React, Next.js, Vue, or any heavy framework.
- Keep the site static-first and SEO-friendly.
- Keep dependencies minimal.
- Use semantic HTML and accessible markup.
- Optimize for fast load performance and mobile responsiveness.

## Business requirements
- Primary services: garage coatings, porch coatings, pool deck coatings.
- Service area: within 40 miles of 29445.
- Outside standard area: show customer-facing note that a small travel fee may apply.
- Minimum project threshold: $1,500.
- Target customer: local residential homeowners.
- Positioning: mid-market, quality-first, premium-value local specialist.
- Primary CTA: Get Estimate.
- Equal emphasis: call and form submission.
- Optional photo upload in estimate flow.

## Estimator requirements
- Use client-side JavaScript only unless a stronger runtime is absolutely necessary.
- Support both preset size options and custom square footage.
- Inputs must include project type, size, indoor/outdoor, surface condition, finish type, timeline, zip code, name, phone, email, and optional photo upload.
- Output must be a price range only, never a fixed quote.
- If estimate is below $1,500, display a professional minimum-threshold message instead of a hard rejection.

## Netlify requirements
- Site must be deployable on Netlify.
- Include static HTML form handling compatible with Netlify forms.
- Add netlify.toml only if needed for configuration, redirects, or functions.
- If functions are needed, keep them minimal and place them in a dedicated netlify/functions directory.

## Content requirements
- Use outcome-first messaging, not jargon-heavy messaging.
- Lead with durability, professionalism, trust, and visual transformation.
- Localize to Charleston, SC and surrounding areas.
- Build pages: Home, About, Services, Gallery, Estimate, Service Area, Reviews, Contact.

## Code quality requirements
- Keep files clean and well organized.
- Use descriptive class names.
- Avoid inline styles unless necessary.
- Comment JavaScript logic clearly.
- Do not generate placeholder framework boilerplate.
- Do not merge directly to main; always work through a pull request.

## Review priorities
- Preserve lightweight architecture.
- Preserve accessibility.
- Preserve SEO structure.
- Preserve mobile-first responsiveness.
- Avoid unnecessary dependencies.
