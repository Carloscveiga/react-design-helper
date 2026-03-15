# react-design

> A work-in-progress React dev helper — inspect and live-tweak your UI without leaving the browser.

## What is this?

Working with Three.js, you get helpers that output live camera positions so you can tweak values in real time and bake them into your code. This project brings that same idea to React.

Instead of jumping to Figma, opening DevTools, or digging through computed styles — you drop an `<EditHelper />` component into any section and get an inline inspector panel that lets you select elements, read their styles, and edit them live.

## How it works

Add `<EditHelper />` inside any section — no extra setup needed:

```tsx
<section className="...">
  <EditHelper />
  <div>...</div>
</section>
```

Click **⚙ inspect** → a panel slides in from the right with:

- **Element tree** — every child element listed with indentation, click any to select it
- **Live highlight** — selected element gets a purple outline on screen
- **Property groups** — contextual controls for the selected element:
  - Layout (display, flex direction, justify, align, gap)
  - Sizing (width, height, max-width, min-height)
  - Padding / Margin
  - Typography (font size, weight, line height, text align, tracking)
  - Colors (background, text)
  - Border (radius, width, color)
  - Effects (opacity, box shadow)

All changes apply instantly as inline styles. Drop it in any section, tweak, close when done.

## Stack

- React + TypeScript
- Tailwind CSS
- Vite

## Status

Work in progress. Current focus is the `EditHelper` inspector component.
