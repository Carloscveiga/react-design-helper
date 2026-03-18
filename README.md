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

This tool is intended for **development environments only**. Do not include it in production bundles. It manipulates the live DOM and reads computed styles at runtime — this has no place in a shipped product.

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

All three controls are linked, changing any one updates the others.