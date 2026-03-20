# React-Design-Helper

> Live UI inspector and style editor for React. Select any element, tweak its styles in real time, and copy the values into your code no 3rd party applications, no DevTools tab required.

## Installation

```bash
# npm
npm install react-design-helper

# pnpm
pnpm add react-design-helper

# yarn
yarn add react-design-helper
```

Then import the component:

```tsx
import { EditHelper } from 'react-design-helper'
```

Works with TypeScript and plain JavaScript. No Tailwind required.

---

## What is this?

**react-design-helper** is a lightweight React component that gives you a live UI inspector and editor directly inside your browser, without leaving your app.

Drop `<EditHelper />` into any section of your React project. Click **⚙ inspect** and a panel slides in showing every element in that section as a tree. Select any element, a `div`, `h1`, `button`, whatever, and instantly edit its styles: font size, colors, spacing, layout, borders, background images, and more. Every change reflects on screen in real time.

No 3rd party tools. No DevTools. No back-and-forth between tools. Just click, tweak, and copy the values you want into your code.

## How it works

Install via npm (above) or copy the source file directly into your project if you want to customise it:

- TypeScript → [`EditHelper.tsx`](src/components/EditHelper.tsx)
- JavaScript → [`EditHelper.jsx`](src/components/EditHelper.jsx)

You can check the example on the file App.tsx where we import the component

```
import { EditHelper } from 'react-design-helper'
```

then we add the component into the section we want edited. 

```tsx
function App() {
  return (

    <>
      <section className="relative w-full min-h-screen bg-white flex items-center justify-center border-b border-gray-200">

        <EditHelper />

      </section>
    <>
  )
}
```

You can add `<EditHelper />` inside multiple sections no extra setup needed:

```tsx
<section className="...">
  <EditHelper />
  <div>...</div>
  <div>
    <EditHelper />
    <div>...</div>
    <div>...</div>
    <div>
      <EditHelper />
      <div>...</div>
    </div>
  </div>
</section>
```

Click **⚙ inspect** → a panel slides in from the right with:

- **Element tree**  every child element listed with indentation, click any to select it
- **Live highlight**  selected element gets a purple outline on screen
- **Property groups**  contextual controls for the selected element:
  - Layout (display, flex direction, justify, align, gap)
  - Sizing (width, height, max-width, min-height)
  - Padding / Margin
  - Typography (font size, weight, line height, text align, tracking)
  - Colors (background color, text color, background image)
  - Border (radius, width, color)
  - Effects (opacity, box shadow)

All changes apply instantly as inline styles. Drop it in any section, tweak, close when done.


## Examples

![Example 1](public/example1.png)

![Example 2](public/example2.png)

## Stack

- React
- Vite

## Compatibility

`EditHelper` has no dependency on Tailwind. It reads styles via the browser's `getComputedStyle()`, so it works with any styling approach. Tailwind, plain CSS, CSS Modules, styled-components, etc.

## ⚠️ Development Only

This tool is intended for **development environments only**. Do not include it in production bundles. It manipulates the live DOM and reads computed styles at runtime this has no place in a shipped product.

If you are using a bundler like Vite or webpack, make sure it is only imported conditionally or tree-shaken out of your production build:

```tsx
{import.meta.env.DEV && <EditHelper />}
```

---

## License

[Apache 2.0](LICENSE)  Copyright 2026 CV-WebWorks

---

## Legal

React is a trademark of Meta Platforms, Inc. This project is an independent open-source tool and is not affiliated with, endorsed by, or sponsored by Meta.

## Status

Work in progress. Current focus is the `EditHelper` inspector component.

### Added background image functionality

Inside the **Colors** group, the **Bg Image** row now lets you set a background image two ways:

- **Paste a URL** into the text field and press Enter or click away
- **Click 📁** to pick a local file, it gets converted to a data URL automatically

A thumbnail preview appears once an image is set. Hit **✕** to clear it.

Three extra controls appear automatically when an image is active:

| Control | Options |
|---|---|
| Bg Size | `cover`, `contain`, `auto`, `100% 100%`, `50%`, `100%` |
| Bg Pos | `center`, `top`, `bottom`, `left`, `right`, `top center`, `bottom center` |
| Bg Repeat | `no-repeat`, `repeat`, `repeat-x`, `repeat-y` |

### Improved Sizing controls

The **Sizing** group (Width, Height, Max Width, Min Height) now has a dedicated control instead of a plain text input:

- **Slider**  drag to scrub the value visually
- **px input**  type an exact pixel value
- **rem input**  type in rem units, automatically converts to px and stays in sync

All four controls are linked, changing any one updates the others. The Height value also auto-updates when Width changes cause the element to reflow.

- **Slider** — drag to scrub visually
- **px** — exact pixel value
- **rem** — rem units, synced with px
- **tw** — Tailwind spacing unit (`px ÷ 4`). Type `4` to get `16px`. Shown in purple so it's easy to spot.

---

## v0.2.0 Changes

### Collapsible element tree

Nodes with children now show a ▶/▼ arrow. Click the arrow to collapse or expand that branch. Click the label to select the element as before.

### Class and content editing

At the top of the properties panel, two new fields appear for the selected element:

- **CLASSES** — shows the full class string (e.g. `max-w-7xl mx-auto flex`). Edit it and press `Enter` or click away to apply instantly. Change `max-w-7xl` to `max-w-2xl` and the element updates live.
- **CONTENT** — appears only on leaf elements with text (e.g. `h1`, `p`, `button`). Edit the text and blur to apply.

### Panel positioning

Click **⚙** in the panel header to open a position menu:

| Option | Layout |
|---|---|
| Right | Vertical sidebar anchored to the right edge (default) |
| Left | Vertical sidebar anchored to the left edge |
| Top | Horizontal bar across the top (tree left, properties right) |
| Bottom | Horizontal bar across the bottom |
| Float | Free-floating draggable window |

In **Float** mode the header becomes a drag handle — mouse and touch both work.

### Resizable panel

A 5px drag handle sits on the inner edge of the panel. Hover it to see it highlight, then drag to resize. Works across all positions. Min 220px, max 800px.

### Full margin controls

The **Margin** group now includes all four sides: Top, Bottom, Left, Right.

---

## v0.2.2 Changes

### Tailwind units across all size controls

Every size input (Sizing, Padding, Margin, Font Size, Line Height) now shows a **tw** field alongside px and rem:

- **tw** — Tailwind spacing unit (`px ÷ 4`). Type `4` to get `16px`. Shown in purple so it's easy to spot.

All four fields (slider, px, rem, tw) stay in sync as you edit any one of them.

### Letter spacing (Tracking)

The **Typography** group now has a dedicated **Tracking** control instead of a plain text input:

- **Slider** — drag to scrub from −0.1em to 0.2em
- **px input** — type an exact pixel value
- **Preset buttons** — quick-set Tailwind tracking values:

| Button | Value |
|---|---|
| tighter | −0.05em |
| tight | −0.025em |
| normal | 0em |
| wide | 0.025em |
| wider | 0.05em |
| widest | 0.1em |

---

## v0.2.3 Changes

### Reorganised property groups

- **Typography** group now includes **Text Color** — font and color in one place
- **Colors** group renamed to **Background** — contains only background-related properties
- **Gap** (Layout) upgraded to full size control with slider, px, rem, and tw fields

### Background color transparency

The **Background Color** control now includes a **Transparency** slider (1–100%) alongside the color picker. Drag it to apply a semi-transparent background as `rgba()`. The slider is capped at 1% minimum to prevent losing the selected color.

### Background color reads Tailwind v4 colors correctly

Color pickers now use a canvas-based conversion instead of regex parsing, so they correctly read colors in any format — including `oklch()` used by Tailwind v4.

### Tracking now has px, rem, and tw inputs

The **Tracking** (letter-spacing) control now matches the layout of all other size controls: slider on top, then px / rem / tw inputs, then the Tailwind preset dropdown.

---

### Font family picker

The **Typography** group now has a **Font** row:

- Shows the element's current computed font
- **📁 load fonts** button opens a folder picker — select any folder containing `.ttf`, `.otf`, `.woff`, or `.woff2` files
- All fonts in the folder are loaded via `@font-face` and listed in a dropdown
- Select any font from the dropdown to apply it instantly
