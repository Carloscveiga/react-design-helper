# React-Design-Helper

> A work-in-progress React dev helper, inspect and live-tweak your UI without leaving the browser.

## What is this?

Working with Three.js, you get helpers that output live camera positions so you can tweak values in real time and bake them into your code. This project brings that same idea to React.

Instead of jumping to Figma, opening DevTools, or digging through computed styles, you drop an `<EditHelper />` component into any section and get an inline inspector panel that lets you select elements, read their styles, and edit them live.

## How it works

Pick the version that matches your project:

- TypeScript → [`EditHelper.tsx`](src/components/EditHelper.tsx)
- JavaScript → [`EditHelper.jsx`](src/components/EditHelper.jsx)

You add it to your project and just import it in the section you want it edited.

You can check the example on the file App.tsx where we import the component

```
import { EditHelper } from './components/EditHelper'
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
    </div>
  </div>
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
  - Colors (background color, text color, background image)
  - Border (radius, width, color)
  - Effects (opacity, box shadow)

All changes apply instantly as inline styles. Drop it in any section, tweak, close when done.


## Examples

![Example 1](public/example1.png)

![Example 2](public/example2.png)

## Stack

- React + TypeScript
- Tailwind CSS
- Vite

## Compatibility

`EditHelper` has no dependency on Tailwind. It reads styles via the browser's `getComputedStyle()`, so it works with any styling approach — Tailwind, plain CSS, CSS Modules, styled-components, etc.

## License

[Apache 2.0](LICENSE) — Copyright 2026 CV-WebWorks

## Status

Work in progress. Current focus is the `EditHelper` inspector component.

### Added background image functionality

Inside the **Colors** group, the **Bg Image** row now lets you set a background image two ways:

- **Paste a URL** into the text field and press Enter or click away
- **Click 📁** to pick a local file — it gets converted to a data URL automatically

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