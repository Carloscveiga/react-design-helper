import { useEffect, useRef, useState } from 'react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rgbToHex(color) {
  if (!color || color === 'transparent') return '#ffffff'
  try {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
    if (a === 0) return '#ffffff'
    return '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('')
  } catch {
    return '#000000'
  }
}

function px(val) { return Math.round(parseFloat(val)) || 0 }

function nodeLabel(el) {
  const tag = el.tagName.toLowerCase()
  const id = el.id ? `#${el.id}` : ''
  const cls = el.className && typeof el.className === 'string'
    ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
    : ''
  return `${tag}${id}${cls}`
}

// ─── Property definitions ─────────────────────────────────────────────────────

const PROPS = [
  // Layout
  { key: 'display', label: 'Display', group: 'Layout', type: 'select',
    options: ['block', 'flex', 'inline-flex', 'inline', 'inline-block', 'grid', 'none'],
    get: s => s.display, set: (el, v) => { el.style.display = v } },
  { key: 'flexDirection', label: 'Direction', group: 'Layout', type: 'select',
    options: ['row', 'row-reverse', 'column', 'column-reverse'],
    cond: s => s.display.includes('flex'),
    get: s => s.flexDirection, set: (el, v) => { el.style.flexDirection = v } },
  { key: 'justifyContent', label: 'Justify', group: 'Layout', type: 'select',
    options: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
    cond: s => s.display.includes('flex'),
    get: s => s.justifyContent, set: (el, v) => { el.style.justifyContent = v } },
  { key: 'alignItems', label: 'Align Items', group: 'Layout', type: 'select',
    options: ['flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
    cond: s => s.display.includes('flex'),
    get: s => s.alignItems, set: (el, v) => { el.style.alignItems = v } },
  { key: 'gap', label: 'Gap', group: 'Layout', type: 'size',
    cond: s => s.display.includes('flex') || s.display === 'grid',
    get: s => `${px(s.gap)}px`, set: (el, v) => { el.style.gap = v } },
  // Sizing
  { key: 'width', label: 'Width', group: 'Sizing', type: 'size',
    get: s => s.width, set: (el, v) => { el.style.width = v } },
  { key: 'height', label: 'Height', group: 'Sizing', type: 'size',
    get: s => s.height, set: (el, v) => { el.style.height = v } },
  { key: 'maxWidth', label: 'Max Width', group: 'Sizing', type: 'size',
    get: s => s.maxWidth, set: (el, v) => { el.style.maxWidth = v } },
  { key: 'minWidth', label: 'Min Width', group: 'Sizing', type: 'size',
    get: s => s.minWidth, set: (el, v) => { el.style.minWidth = v } },
  { key: 'minHeight', label: 'Min Height', group: 'Sizing', type: 'size',
    get: s => s.minHeight, set: (el, v) => { el.style.minHeight = v } },
  { key: 'maxHeight', label: 'Max Height', group: 'Sizing', type: 'size',
    get: s => s.maxHeight, set: (el, v) => { el.style.maxHeight = v } },
  // Padding
  { key: 'paddingTop', label: 'Top', group: 'Padding', type: 'size',
    get: s => s.paddingTop, set: (el, v) => { el.style.paddingTop = v } },
  { key: 'paddingRight', label: 'Right', group: 'Padding', type: 'size',
    get: s => s.paddingRight, set: (el, v) => { el.style.paddingRight = v } },
  { key: 'paddingBottom', label: 'Bottom', group: 'Padding', type: 'size',
    get: s => s.paddingBottom, set: (el, v) => { el.style.paddingBottom = v } },
  { key: 'paddingLeft', label: 'Left', group: 'Padding', type: 'size',
    get: s => s.paddingLeft, set: (el, v) => { el.style.paddingLeft = v } },
  // Margin
  { key: 'marginTop', label: 'Top', group: 'Margin', type: 'size',
    get: s => s.marginTop, set: (el, v) => { el.style.marginTop = v } },
  { key: 'marginBottom', label: 'Bottom', group: 'Margin', type: 'size',
    get: s => s.marginBottom, set: (el, v) => { el.style.marginBottom = v } },
  { key: 'marginLeft', label: 'Left', group: 'Margin', type: 'size',
    get: s => s.marginLeft, set: (el, v) => { el.style.marginLeft = v } },
  { key: 'marginRight', label: 'Right', group: 'Margin', type: 'size',
    get: s => s.marginRight, set: (el, v) => { el.style.marginRight = v } },
  // Typography
  { key: 'fontFamily', label: 'Font', group: 'Typography', type: 'font',
    get: s => s.fontFamily, set: (el, v) => { el.style.fontFamily = v } },
  { key: 'fontSize', label: 'Size', group: 'Typography', type: 'size',
    get: s => s.fontSize, set: (el, v) => { el.style.fontSize = v } },
  { key: 'fontWeight', label: 'Weight', group: 'Typography', type: 'select',
    options: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    get: s => s.fontWeight, set: (el, v) => { el.style.fontWeight = v } },
  { key: 'lineHeight', label: 'Line Height', group: 'Typography', type: 'size',
    get: s => s.lineHeight, set: (el, v) => { el.style.lineHeight = v } },
  { key: 'textAlign', label: 'Align', group: 'Typography', type: 'select',
    options: ['left', 'center', 'right', 'justify'],
    get: s => s.textAlign, set: (el, v) => { el.style.textAlign = v } },
  { key: 'letterSpacing', label: 'Tracking', group: 'Typography', type: 'tracking',
    get: s => s.letterSpacing, set: (el, v) => { el.style.letterSpacing = v } },
  { key: 'color', label: 'Text Color', group: 'Typography', type: 'color',
    get: s => rgbToHex(s.color), set: (el, v) => { el.style.color = v } },
  // Colors
  { key: 'backgroundColor', label: 'Background Color', group: 'Background', type: 'color-alpha',
    get: s => s.backgroundColor, set: (el, v) => { el.style.backgroundColor = v } },
  { key: 'backgroundImage', label: 'Bg Image', group: 'Background', type: 'image',
    get: s => s.backgroundImage, set: (el, v) => { el.style.backgroundImage = v } },
  { key: 'backgroundSize', label: 'Bg Size', group: 'Background', type: 'select',
    options: ['cover', 'contain', 'auto', '100% 100%', '50%', '100%'],
    cond: s => s.backgroundImage !== 'none',
    get: s => s.backgroundSize, set: (el, v) => { el.style.backgroundSize = v } },
  { key: 'backgroundPosition', label: 'Bg Pos', group: 'Background', type: 'select',
    options: ['center', 'top', 'bottom', 'left', 'right', 'top center', 'bottom center'],
    cond: s => s.backgroundImage !== 'none',
    get: s => s.backgroundPosition, set: (el, v) => { el.style.backgroundPosition = v } },
  { key: 'backgroundRepeat', label: 'Bg Repeat', group: 'Background', type: 'select',
    options: ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'],
    cond: s => s.backgroundImage !== 'none',
    get: s => s.backgroundRepeat, set: (el, v) => { el.style.backgroundRepeat = v } },
  // Border
  { key: 'borderRadius', label: 'Radius', group: 'Border', type: 'range', min: 0, max: 50, unit: 'px',
    get: s => String(px(s.borderRadius)), set: (el, v) => { el.style.borderRadius = `${v}px` } },
  { key: 'borderWidth', label: 'Width', group: 'Border', type: 'range', min: 0, max: 10, unit: 'px',
    get: s => String(px(s.borderWidth)),
    set: (el, v) => { el.style.borderWidth = `${v}px`; if (parseInt(v) > 0) el.style.borderStyle = 'solid' } },
  { key: 'borderColor', label: 'Color', group: 'Border', type: 'color',
    get: s => rgbToHex(s.borderColor), set: (el, v) => { el.style.borderColor = v } },
  // Effects
  { key: 'opacity', label: 'Opacity', group: 'Effects', type: 'range', min: 0, max: 100, step: 1, unit: '%',
    get: s => String(Math.round(parseFloat(s.opacity) * 100)),
    set: (el, v) => { el.style.opacity = String(parseInt(v) / 100) } },
  { key: 'boxShadow', label: 'Shadow', group: 'Effects', type: 'select',
    options: ['none', '0 1px 3px rgba(0,0,0,0.12)', '0 4px 6px rgba(0,0,0,0.1)', '0 10px 15px rgba(0,0,0,0.1)', '0 20px 25px rgba(0,0,0,0.15)'],
    get: s => s.boxShadow, set: (el, v) => { el.style.boxShadow = v } },
]

const GROUPS = ['Layout', 'Sizing', 'Padding', 'Margin', 'Typography', 'Background', 'Border', 'Effects']

// ─── DOM walker ───────────────────────────────────────────────────────────────

function walk(root, skip, depth, out, counter) {
  for (const child of root.children) {
    if (child === skip) continue
    out.push({ id: counter.n++, el: child, depth })
    walk(child, skip, depth + 1, out, counter)
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const inputStyle = {
  background: '#27272a', color: '#e4e4e7', border: '1px solid #3f3f46',
  borderRadius: 4, fontSize: 10, fontFamily: 'monospace', padding: '2px 4px', width: '100%',
}

function SizeInput({ value, onChange }) {
  const numPx = Math.round(parseFloat(value)) || 0
  const numRem = parseFloat((numPx / 16).toFixed(2))
  const numTw = parseFloat((numPx / 4).toFixed(2))
  const sliderVal = Math.min(Math.max(numPx, 0), 2000)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input
        type="range" min={0} max={2000} value={sliderVal}
        onChange={e => onChange(`${e.target.value}px`)}
        style={{ width: '100%', accentColor: '#6366f1', height: 4, marginTop: 4 }}
      />
      <div style={{ display: 'flex', gap: 4 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
          <input type="number" value={numPx} min={0}
            onChange={e => onChange(`${e.target.value}px`)}
            style={inputStyle} />
          <span style={{ color: '#52525b', fontSize: 9, flexShrink: 0 }}>px</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
          <input type="number" value={numRem} step={0.25} min={0}
            onChange={e => onChange(`${Math.round(parseFloat(e.target.value) * 16)}px`)}
            style={inputStyle} />
          <span style={{ color: '#52525b', fontSize: 9, flexShrink: 0 }}>rem</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
          <input type="number" value={numTw} step={0.5} min={0}
            onChange={e => onChange(`${parseFloat(e.target.value) * 4}px`)}
            style={inputStyle} />
          <span style={{ color: '#a78bfa', fontSize: 9, flexShrink: 0 }}>tw</span>
        </div>
      </div>
    </div>
  )
}

const TW_TRACKING = [
  { label: 'tighter', value: '-0.05em' },
  { label: 'tight',   value: '-0.025em' },
  { label: 'normal',  value: '0em' },
  { label: 'wide',    value: '0.025em' },
  { label: 'wider',   value: '0.05em' },
  { label: 'widest',  value: '0.1em' },
]

function FontInput({ value, onChange }) {
  const [fonts, setFonts] = useState([])
  const folderRef = useRef(null)

  useEffect(() => {
    if (folderRef.current) folderRef.current.setAttribute('webkitdirectory', '')
  }, [])

  const currentFont = value.split(',')[0].trim().replace(/['"]/g, '')

  async function handleFolderLoad(e) {
    const files = Array.from(e.target.files).filter(f => /\.(ttf|otf|woff|woff2)$/i.test(f.name))
    const loaded = []
    for (const file of files) {
      const fontName = file.name.replace(/\.[^.]+$/, '')
      const url = URL.createObjectURL(file)
      const style = document.createElement('style')
      style.textContent = `@font-face { font-family: '${fontName}'; src: url('${url}'); }`
      document.head.appendChild(style)
      loaded.push(fontName)
    }
    setFonts(prev => [...new Set([...prev, ...loaded])])
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <span style={{ flex: 1, color: '#a1a1aa', fontSize: 10, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {currentFont}
        </span>
        <button onClick={() => folderRef.current?.click()}
          style={{ background: '#27272a', border: '1px solid #3f3f46', borderRadius: 4, color: '#a1a1aa', cursor: 'pointer', fontSize: 11, padding: '2px 8px', flexShrink: 0 }}
          title="Load fonts from folder">📁 load fonts
        </button>
        <input ref={folderRef} type="file" onChange={handleFolderLoad} style={{ display: 'none' }} />
      </div>
      {fonts.length > 0 && (
        <select
          value={currentFont}
          onChange={e => onChange(e.target.value)}
          style={{ background: '#27272a', color: '#e4e4e7', border: '1px solid #3f3f46', borderRadius: 4, fontSize: 10, fontFamily: 'monospace', padding: '3px 4px' }}
        >
          {fonts.map(f => (
            <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
          ))}
        </select>
      )}
    </div>
  )
}

function TrackingInput({ value, onChange }) {
  const numPx = parseFloat(value) || 0
  const numRem = parseFloat((numPx / 16).toFixed(4))
  const numTw = parseFloat((numPx / 4).toFixed(4))
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input type="range" min={-10} max={40} step={0.5} value={numPx}
        onChange={e => onChange(`${e.target.value}px`)}
        style={{ width: '100%', accentColor: '#6366f1', height: 4, marginTop: 4 }} />
      <div style={{ display: 'flex', gap: 4 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
          <input type="number" value={numPx} step={0.5}
            onChange={e => onChange(`${e.target.value}px`)}
            style={inputStyle} />
          <span style={{ color: '#52525b', fontSize: 9, flexShrink: 0 }}>px</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
          <input type="number" value={numRem} step={0.0625}
            onChange={e => onChange(`${parseFloat(e.target.value) * 16}px`)}
            style={inputStyle} />
          <span style={{ color: '#52525b', fontSize: 9, flexShrink: 0 }}>rem</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
          <input type="number" value={numTw} step={0.25}
            onChange={e => onChange(`${parseFloat(e.target.value) * 4}px`)}
            style={inputStyle} />
          <span style={{ color: '#a78bfa', fontSize: 9, flexShrink: 0 }}>tw</span>
        </div>
      </div>
      <select
        defaultValue=""
        onChange={e => { if (e.target.value) onChange(e.target.value) }}
        style={{ background: '#27272a', color: '#e4e4e7', border: '1px solid #3f3f46', borderRadius: 4, fontSize: 10, fontFamily: 'monospace', padding: '2px 4px' }}
      >
        <option value="" disabled>tw preset...</option>
        {TW_TRACKING.map(t => (
          <option key={t.label} value={t.value}>tracking-{t.label} ({t.value})</option>
        ))}
      </select>
    </div>
  )
}

function BgImageInput({ value, onChange }) {
  const fileRef = useRef(null)
  const rawUrl = value && value !== 'none'
    ? value.replace(/^url\(["']?/, '').replace(/["']?\)$/, '')
    : ''
  const [inputVal, setInputVal] = useState(rawUrl)

  useEffect(() => { setInputVal(rawUrl) }, [value])

  function apply(url) {
    onChange(url ? `url("${url}")` : 'none')
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { if (ev.target?.result) onChange(`url("${ev.target.result}")`) }
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {value && value !== 'none' && (
        <div style={{
          width: '100%', height: 48, borderRadius: 4,
          backgroundImage: value, backgroundSize: 'cover', backgroundPosition: 'center',
          border: '1px solid #3f3f46',
        }} />
      )}
      <div style={{ display: 'flex', gap: 4 }}>
        <input
          type="text"
          placeholder="paste image URL..."
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onBlur={() => apply(inputVal)}
          onKeyDown={e => e.key === 'Enter' && apply(inputVal)}
          style={{ flex: 1, background: '#27272a', color: '#e4e4e7', border: '1px solid #3f3f46',
            borderRadius: 4, fontSize: 10, fontFamily: 'monospace', padding: '2px 6px' }}
        />
        <button onClick={() => fileRef.current?.click()}
          style={{ background: '#27272a', border: '1px solid #3f3f46', borderRadius: 4,
            color: '#a1a1aa', cursor: 'pointer', fontSize: 11, padding: '0 6px' }}
          title="Pick local file">📁</button>
        {value && value !== 'none' && (
          <button onClick={() => { setInputVal(''); onChange('none') }}
            style={{ background: '#27272a', border: '1px solid #3f3f46', borderRadius: 4,
              color: '#71717a', cursor: 'pointer', fontSize: 11, padding: '0 6px' }}
            title="Remove image">✕</button>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      </div>
    </div>
  )
}

function ResizeHandle({ pos, onMouseDown }) {
  const [hovered, setHovered] = useState(false)
  const edgeStyle =
    pos === 'right'  ? { left: 0,   top: 0, bottom: 0, width: 5,  cursor: 'col-resize' } :
    pos === 'left'   ? { right: 0,  top: 0, bottom: 0, width: 5,  cursor: 'col-resize' } :
    pos === 'top'    ? { bottom: 0, left: 0, right: 0, height: 5, cursor: 'row-resize' } :
                       { top: 0,    left: 0, right: 0, height: 5, cursor: 'row-resize' }
  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'absolute', ...edgeStyle, background: hovered ? 'rgba(99,102,241,0.5)' : 'transparent', transition: 'background 0.15s', zIndex: 1 }}
    />
  )
}

function ColorAlphaInput({ value, onChange }) {
  const getRgba = (color) => {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 1
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, 1, 1)
      ctx.fillStyle = color
      ctx.fillRect(0, 0, 1, 1)
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
      return { r, g, b, a }
    } catch {
      return { r: 0, g: 0, b: 0, a: 255 }
    }
  }
  const { r, g, b, a } = getRgba(value)
  const hex = '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('')
  const alpha = Math.round((a / 255) * 100)

  const emit = (newHex, newAlpha) => {
    const r = parseInt(newHex.slice(1, 3), 16)
    const g = parseInt(newHex.slice(3, 5), 16)
    const b = parseInt(newHex.slice(5, 7), 16)
    const a = +(newAlpha / 100).toFixed(2)
    onChange(a >= 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input type="color" value={hex} onChange={e => emit(e.target.value, alpha)}
          style={{ width: 24, height: 20, border: 'none', background: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }} />
        <span style={{ color: '#a1a1aa', fontFamily: 'monospace', fontSize: 10, flex: 1 }}>{hex}</span>
        <span style={{ color: '#a1a1aa', fontFamily: 'monospace', fontSize: 10, minWidth: 30, textAlign: 'right' }}>{alpha}%</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#71717a', fontSize: 9, fontFamily: 'monospace', flexShrink: 0 }}>Transparency</span>
        <input type="range" min={1} max={100} value={alpha}
          onChange={e => emit(hex, +e.target.value)}
          style={{ flex: 1, accentColor: '#6366f1', height: 4 }} />
      </div>
    </div>
  )
}

function PropRow({ prop, value, origVal, onChange }) {
  const isSize = prop.type === 'size' || prop.type === 'tracking' || prop.type === 'font' || prop.type === 'color-alpha'
  const isDirty = value !== origVal
  return (
    <div style={{ display: 'flex', alignItems: isSize ? 'flex-start' : 'center', gap: 6, padding: isSize ? '8px 0' : '3px 0', minHeight: 26 }}>
      <div style={{ width: 74, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3, paddingTop: isSize ? 5 : 0 }}>
        <span style={{ fontSize: 10, color: isDirty ? '#a78bfa' : '#71717a', fontFamily: 'monospace' }}>{prop.label}</span>
        {isDirty && (
          <button onClick={() => onChange(origVal)} title="Reset to original"
            style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: 10, padding: 0, lineHeight: 1, flexShrink: 0 }}>↺</button>
        )}
      </div>

      {prop.type === 'color-alpha' && (
        <ColorAlphaInput value={value} onChange={onChange} />
      )}

      {prop.type === 'color' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
          <input type="color" value={value} onChange={e => onChange(e.target.value)}
            style={{ width: 24, height: 20, border: 'none', background: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }} />
          <span style={{ color: '#a1a1aa', fontFamily: 'monospace', fontSize: 10 }}>{value}</span>
        </div>
      )}

      {prop.type === 'range' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
          <input type="range" min={prop.min} max={prop.max} step={prop.step ?? 1} value={value}
            onChange={e => onChange(e.target.value)}
            style={{ flex: 1, accentColor: '#6366f1', height: 4 }} />
          <span style={{ color: '#e4e4e7', fontFamily: 'monospace', fontSize: 10, minWidth: 36, textAlign: 'right' }}>
            {value}{prop.unit}
          </span>
        </div>
      )}

      {prop.type === 'select' && (
        <select value={value} onChange={e => onChange(e.target.value)}
          style={{ flex: 1, background: '#27272a', color: '#e4e4e7', border: '1px solid #3f3f46',
            borderRadius: 4, fontSize: 10, fontFamily: 'monospace', padding: '2px 4px' }}>
          {prop.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )}

      {prop.type === 'text' && (
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          style={{ flex: 1, background: '#27272a', color: '#e4e4e7', border: '1px solid #3f3f46',
            borderRadius: 4, fontSize: 10, fontFamily: 'monospace', padding: '2px 6px' }} />
      )}

      {prop.type === 'image' && (
        <BgImageInput value={value} onChange={onChange} />
      )}

      {prop.type === 'size' && (
        <SizeInput value={value} onChange={onChange} />
      )}

      {prop.type === 'tracking' && (
        <TrackingInput value={value} onChange={onChange} />
      )}

      {prop.type === 'font' && (
        <FontInput value={value} onChange={onChange} />
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EditHelper() {
  const wrapRef = useRef(null)
  const [open, setOpen] = useState(false)


  // Auto-set positioning context on parent if missing
  useEffect(() => {
    const parent = wrapRef.current?.parentElement
    if (!parent) return
    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative'
    }
  }, [])

  const [nodes, setNodes] = useState([])
  const [selId, setSelId] = useState(null)
  const [vals, setVals] = useState({})
  const [origVals, setOrigVals] = useState({})
  const [classEditActive, setClassEditActive] = useState(false)
  const [origClassName, setOrigClassName] = useState('')
  const [contentEditActive, setContentEditActive] = useState(false)
  const [origContent, setOrigContent] = useState('')
  const [copied, setCopied] = useState(null)

  function copyText(text, type) {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 1500)
  }
  const [collapsed, setCollapsed] = useState(new Set())
  const [collapsedTree, setCollapsedTree] = useState(new Set())
  const prevHighlight = useRef(null)

  // Build tree when panel opens
  useEffect(() => {
    if (!open || !wrapRef.current) return
    const parent = wrapRef.current.parentElement
    if (!parent) return

    const children = []
    walk(parent, wrapRef.current, 1, children, { n: 1 })

    const all = [{ id: 0, el: parent, depth: 0 }, ...children]
    all.forEach((n, i) => { n.hasChildren = i < all.length - 1 && all[i + 1].depth > n.depth })
    setNodes(all)
    selectNode(all[0], all)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Re-read all values whenever the selected element resizes
  useEffect(() => {
    const node = nodes.find(n => n.id === selId)
    if (!node) return
    const observer = new ResizeObserver(() => setVals(readVals(node.el)))
    observer.observe(node.el)
    return () => observer.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selId, nodes])

  function readVals(el) {
    const s = getComputedStyle(el)
    const out = {}
    PROPS.forEach(p => { out[p.key] = p.get(s) })
    return out
  }

  function highlight(el) {
    if (prevHighlight.current) {
      prevHighlight.current.el.style.outline = prevHighlight.current.outline
    }
    prevHighlight.current = { el, outline: el.style.outline }
    el.style.outline = '2px solid #6366f1'
    el.style.outlineOffset = '2px'
  }

  function selectNode(node, nodeList) {
    highlight(node.el)
    setSelId(node.id)
    const v = readVals(node.el)
    setVals(v)
    setOrigVals(v)
    setClassEditActive(false)
    setOrigClassName('')
    setContentEditActive(false)
    setOrigContent('')
    if (nodeList) setNodes(nodeList)
  }

  function handleClose() {
    if (prevHighlight.current) {
      prevHighlight.current.el.style.outline = prevHighlight.current.outline
      prevHighlight.current.el.style.outlineOffset = ''
      prevHighlight.current = null
    }
    setOpen(false)
  }

  function applyProp(prop, value) {
    const node = nodes.find(n => n.id === selId)
    if (!node) return
    prop.set(node.el, value)
    setVals(prev => ({ ...prev, [prop.key]: value }))
  }

  function toggleTreeNode(id, e) {
    e.stopPropagation()
    setCollapsedTree(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function getVisibleNodes() {
    const visible = []
    let hiddenDepth = null
    for (const node of nodes) {
      if (hiddenDepth !== null) {
        if (node.depth > hiddenDepth) continue
        else hiddenDepth = null
      }
      visible.push(node)
      if (collapsedTree.has(node.id)) hiddenDepth = node.depth
    }
    return visible
  }

  function toggleGroup(g) {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(g)) next.delete(g); else next.add(g)
      return next
    })
  }

  const [panelPos, setPanelPos] = useState('right')
  const [showSettings, setShowSettings] = useState(false)
  const [panelSize, setPanelSize] = useState(320)
  const [floatPos, setFloatPos] = useState({ x: 80, y: 80 })
  const [showGrid, setShowGrid] = useState(false)
  const [showGridSettings, setShowGridSettings] = useState(false)
  const [gridCols, setGridCols] = useState(12)
  const [gridGutter, setGridGutter] = useState(16)
  const [gridMargin, setGridMargin] = useState(24)
  const [gridColor, setGridColor] = useState('#ff0066')
  const [gridOpacity, setGridOpacity] = useState(10)

  const isHorizontal = panelPos === 'top' || panelPos === 'bottom'

  function getPanelStyle() {
    const base = {
      position: 'fixed', background: '#18181b',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'monospace', fontSize: 11, zIndex: 9999,
    }
    switch (panelPos) {
      case 'left':   return { ...base, top: 0, left: 0, bottom: 0, width: panelSize, borderRight: '1px solid #3f3f46', boxShadow: '8px 0 32px rgba(0,0,0,0.5)' }
      case 'top':    return { ...base, top: 0, left: 0, right: 0, height: panelSize, borderBottom: '1px solid #3f3f46', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }
      case 'bottom': return { ...base, bottom: 0, left: 0, right: 0, height: panelSize, borderTop: '1px solid #3f3f46', boxShadow: '0 -8px 32px rgba(0,0,0,0.5)' }
      case 'float':  return { ...base, left: floatPos.x, top: floatPos.y, width: panelSize, maxHeight: '80vh', border: '1px solid #3f3f46', borderRadius: 8, boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }
      default:       return { ...base, top: 0, right: 0, bottom: 0, width: panelSize, borderLeft: '1px solid #3f3f46', boxShadow: '-8px 0 32px rgba(0,0,0,0.5)' }
    }
  }

  function startDragPanel(e) {
    if (panelPos !== 'float') return
    const startX = e.clientX - floatPos.x
    const startY = e.clientY - floatPos.y
    function onMove(e) { setFloatPos({ x: e.clientX - startX, y: e.clientY - startY }) }
    function onUp() { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function startDragPanelTouch(e) {
    if (panelPos !== 'float') return
    const t = e.touches[0]
    const startX = t.clientX - floatPos.x
    const startY = t.clientY - floatPos.y
    function onMove(e) { const t = e.touches[0]; setFloatPos({ x: t.clientX - startX, y: t.clientY - startY }) }
    function onEnd() { window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd) }
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
  }

  function startResize(e) {
    e.preventDefault()
    const startPos = isHorizontal ? e.clientY : e.clientX
    const startSize = panelSize
    function onMove(e) {
      const delta = isHorizontal ? e.clientY - startPos : e.clientX - startPos
      const newSize =
        panelPos === 'right'  ? startSize - delta :
        panelPos === 'left'   ? startSize + delta :
        panelPos === 'bottom' ? startSize - delta :
                                startSize + delta
      setPanelSize(Math.max(220, Math.min(800, newSize)))
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const POSITIONS = [
    { key: 'right',  label: 'Right',  icon: '▶' },
    { key: 'left',   label: 'Left',   icon: '◀' },
    { key: 'top',    label: 'Top',    icon: '▲' },
    { key: 'bottom', label: 'Bottom', icon: '▼' },
    { key: 'float',  label: 'Float',  icon: '⊞' },
  ]

  const selectedNode = nodes.find(n => n.id === selId)
  const computedStyles = selectedNode ? getComputedStyle(selectedNode.el) : null

  const treeContent = (
    <div style={isHorizontal
      ? { width: 220, borderRight: '1px solid #3f3f46', overflowY: 'auto', padding: '8px 10px', flexShrink: 0 }
      : { padding: '8px 14px 4px' }
    }>
      <div style={{ color: '#52525b', letterSpacing: '0.1em', fontSize: 9, marginBottom: 6 }}>TREE</div>
      <div style={{ overflowY: 'auto', maxHeight: isHorizontal ? 'none' : 200 }}>
        {getVisibleNodes().map(node => (
          <div
            key={node.id}
            onClick={() => selectNode(node)}
            style={{
              paddingLeft: 4 + node.depth * 10,
              paddingTop: 3, paddingBottom: 3, paddingRight: 4,
              color: node.id === selId ? '#a5b4fc' : '#71717a',
              background: node.id === selId ? 'rgba(99,102,241,0.12)' : 'transparent',
              cursor: 'pointer', borderRadius: 4,
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
            }}
          >
            {node.hasChildren
              ? <span onClick={e => toggleTreeNode(node.id, e)}
                  style={{ fontSize: 8, color: '#52525b', flexShrink: 0, userSelect: 'none', padding: '0 2px' }}>
                  {collapsedTree.has(node.id) ? '▶' : '▼'}
                </span>
              : <span style={{ width: 12, flexShrink: 0 }} />
            }
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {nodeLabel(node.el)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  const propertiesContent = selectedNode && computedStyles && (
    <div style={{ flex: 1, overflowY: 'auto', padding: '6px 14px 16px' }}>
      <div style={{ color: '#a5b4fc', fontSize: 11, marginBottom: 10, letterSpacing: '0.05em' }}>
        &lt;{selectedNode.el.tagName.toLowerCase()}&gt;
      </div>

      {/* Classes */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: '#52525b', fontSize: 9, letterSpacing: '0.1em' }}>CLASSES</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {copied === 'classes' && <span style={{ color: '#4ade80', fontSize: 9, fontFamily: 'monospace' }}>✓ copied</span>}
            <button onClick={() => copyText(selectedNode.el.className, 'classes')}
              style={{ background: 'none', border: '1px solid #3f3f46', color: '#71717a', fontSize: 9, fontFamily: 'monospace', borderRadius: 3, padding: '1px 6px', cursor: 'pointer' }}>copy</button>
            {!classEditActive
              ? <button onClick={() => { setOrigClassName(selectedNode.el.className); setClassEditActive(true) }}
                  style={{ background: 'none', border: '1px solid #3f3f46', color: '#71717a', fontSize: 9, fontFamily: 'monospace', borderRadius: 3, padding: '1px 6px', cursor: 'pointer' }}>edit</button>
              : <button onClick={() => { selectedNode.el.className = origClassName; setClassEditActive(false) }}
                  style={{ background: 'none', border: '1px solid #3f3f46', color: '#f87171', fontSize: 9, fontFamily: 'monospace', borderRadius: 3, padding: '1px 6px', cursor: 'pointer' }}>↺ reset</button>
            }
          </div>
        </div>
        {classEditActive && (
          <input
            type="text"
            defaultValue={origClassName}
            key={selectedNode.id + '-class-edit'}
            onBlur={e => { selectedNode.el.className = e.target.value }}
            onKeyDown={e => { if (e.key === 'Enter') { selectedNode.el.className = e.currentTarget.value; e.currentTarget.blur() } }}
            style={{ width: '100%', background: '#27272a', color: '#e4e4e7', border: '1px solid #6366f1', borderRadius: 4, fontSize: 10, fontFamily: 'monospace', padding: '4px 6px', boxSizing: 'border-box', marginBottom: 4 }}
          />
        )}
        <input
          type="text"
          readOnly
          defaultValue={selectedNode.el.className}
          key={selectedNode.id + '-class'}
          style={{ width: '100%', background: '#27272a', color: classEditActive ? '#52525b' : '#71717a', border: '1px solid #3f3f46', borderRadius: 4, fontSize: 10, fontFamily: 'monospace', padding: '4px 6px', boxSizing: 'border-box', cursor: 'default' }}
        />
      </div>

      {/* Text content */}
      {selectedNode.el.childElementCount === 0 && selectedNode.el.textContent?.trim() !== '' && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: '#52525b', fontSize: 9, letterSpacing: '0.1em' }}>CONTENT</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {copied === 'content' && <span style={{ color: '#4ade80', fontSize: 9, fontFamily: 'monospace' }}>✓ copied</span>}
              <button onClick={() => copyText(selectedNode.el.textContent ?? '', 'content')}
                style={{ background: 'none', border: '1px solid #3f3f46', color: '#71717a', fontSize: 9, fontFamily: 'monospace', borderRadius: 3, padding: '1px 6px', cursor: 'pointer' }}>copy</button>
              {!contentEditActive
                ? <button onClick={() => { setOrigContent(selectedNode.el.textContent ?? ''); setContentEditActive(true) }}
                    style={{ background: 'none', border: '1px solid #3f3f46', color: '#71717a', fontSize: 9, fontFamily: 'monospace', borderRadius: 3, padding: '1px 6px', cursor: 'pointer' }}>edit</button>
                : <button onClick={() => { selectedNode.el.textContent = origContent; setContentEditActive(false) }}
                    style={{ background: 'none', border: '1px solid #3f3f46', color: '#f87171', fontSize: 9, fontFamily: 'monospace', borderRadius: 3, padding: '1px 6px', cursor: 'pointer' }}>↺ reset</button>
              }
            </div>
          </div>
          {contentEditActive && (
            <textarea
              defaultValue={origContent}
              key={selectedNode.id + '-content-edit'}
              onBlur={e => { selectedNode.el.textContent = e.target.value }}
              rows={2}
              style={{ width: '100%', background: '#27272a', color: '#e4e4e7', border: '1px solid #6366f1', borderRadius: 4, fontSize: 10, fontFamily: 'monospace', padding: '4px 6px', boxSizing: 'border-box', resize: 'vertical', marginBottom: 4 }}
            />
          )}
          <textarea
            readOnly
            defaultValue={selectedNode.el.textContent ?? ''}
            key={selectedNode.id + '-content'}
            rows={2}
            style={{ width: '100%', background: '#27272a', color: contentEditActive ? '#52525b' : '#71717a', border: '1px solid #3f3f46', borderRadius: 4, fontSize: 10, fontFamily: 'monospace', padding: '4px 6px', boxSizing: 'border-box', resize: 'none', cursor: 'default' }}
          />
        </div>
      )}

      <div style={{ height: 1, background: '#3f3f46', marginBottom: 10 }} />

      {GROUPS.map(group => {
        const groupProps = PROPS.filter(p => p.group === group && (!p.cond || p.cond(computedStyles)))
        if (!groupProps.length) return null
        const isCollapsed = collapsed.has(group)
        return (
          <div key={group} style={{ marginBottom: 6 }}>
            <div onClick={() => toggleGroup(group)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#52525b', fontSize: 9, letterSpacing: '0.1em', cursor: 'pointer', padding: '4px 0', userSelect: 'none' }}>
              <span style={{ fontSize: 8 }}>{isCollapsed ? '▶' : '▼'}</span>
              {group.toUpperCase()}
            </div>
            {!isCollapsed && (
              <div style={{ paddingLeft: 2 }}>
                {groupProps.map(prop => (
                  <PropRow key={prop.key} prop={prop} value={vals[prop.key] ?? ''} origVal={origVals[prop.key] ?? ''} onChange={v => applyProp(prop, v)} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  const gridOverlay = showGrid && (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none', display: 'flex', paddingLeft: gridMargin, paddingRight: gridMargin, boxSizing: 'border-box', gap: gridGutter }}>
      {Array.from({ length: gridCols }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: '100%', backgroundColor: gridColor, opacity: gridOpacity / 100 }} />
      ))}
    </div>
  )

  return (
    <div ref={wrapRef} style={{ position: 'absolute', top: 10, right: 10, zIndex: 9999 }}>
      {gridOverlay}
      {/* Toggle button */}
      <button
        onClick={() => open ? handleClose() : setOpen(true)}
        style={{
          padding: '4px 12px', fontSize: 11, fontFamily: 'monospace',
          background: open ? '#18181b' : '#f4f4f5',
          color: open ? '#a1a1aa' : '#3f3f46',
          border: '1px solid #e4e4e7', borderRadius: 6,
          cursor: 'pointer', letterSpacing: '0.05em',
        }}
      >
        {open ? '✕ close' : '⚙ inspect'}
      </button>

      {/* Fixed panel */}
      {open && (
        <div style={getPanelStyle()}>
          <ResizeHandle pos={panelPos} onMouseDown={startResize} />

          {/* Header */}
          <div
            onMouseDown={startDragPanel}
            onTouchStart={startDragPanelTouch}
            style={{ padding: '10px 14px', borderBottom: '1px solid #3f3f46', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, cursor: panelPos === 'float' ? 'grab' : 'default', userSelect: 'none' }}
          >
            <span style={{ color: '#e4e4e7', letterSpacing: '0.1em', fontSize: 11 }}>◈ INSPECTOR</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* Grid overlay */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setShowGridSettings(p => !p); setShowSettings(false) }}
                  title="Layout grid"
                  style={{ background: 'none', border: 'none', color: showGrid ? '#f472b6' : (showGridSettings ? '#a5b4fc' : '#71717a'), cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: '2px 4px' }}
                >⊞</button>
                {showGridSettings && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: '#27272a', border: '1px solid #3f3f46', borderRadius: 6, padding: 10, zIndex: 10001, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ color: '#52525b', fontSize: 9, letterSpacing: '0.1em' }}>LAYOUT GRID</div>
                    <button onClick={() => setShowGrid(p => !p)} style={{ background: showGrid ? 'rgba(244,114,182,0.15)' : 'rgba(99,102,241,0.1)', border: `1px solid ${showGrid ? '#f472b6' : '#3f3f46'}`, color: showGrid ? '#f472b6' : '#a1a1aa', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 10, fontFamily: 'monospace' }}>
                      {showGrid ? '◉ grid on' : '○ grid off'}
                    </button>
                    {[
                      { label: 'Columns', value: gridCols, set: setGridCols, min: 1, max: 24, step: 1 },
                      { label: 'Gutter px', value: gridGutter, set: setGridGutter, min: 0, max: 80, step: 2 },
                      { label: 'Margin px', value: gridMargin, set: setGridMargin, min: 0, max: 200, step: 4 },
                      { label: 'Opacity %', value: gridOpacity, set: setGridOpacity, min: 1, max: 50, step: 1 },
                    ].map(({ label, value, set, min, max, step }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#71717a', fontSize: 9, fontFamily: 'monospace', width: 60, flexShrink: 0 }}>{label}</span>
                        <input type="range" min={min} max={max} step={step} value={value}
                          onChange={e => set(+e.target.value)}
                          style={{ flex: 1, accentColor: '#f472b6', height: 4 }} />
                        <span style={{ color: '#e4e4e7', fontSize: 9, fontFamily: 'monospace', width: 24, textAlign: 'right' }}>{value}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#71717a', fontSize: 9, fontFamily: 'monospace', width: 60, flexShrink: 0 }}>Color</span>
                      <input type="color" value={gridColor} onChange={e => setGridColor(e.target.value)}
                        style={{ width: 24, height: 20, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
                      <span style={{ color: '#a1a1aa', fontSize: 9, fontFamily: 'monospace' }}>{gridColor}</span>
                    </div>
                  </div>
                )}
              </div>
              {/* Settings */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowSettings(p => !p)}
                  title="Panel position"
                  style={{ background: 'none', border: 'none', color: showSettings ? '#a5b4fc' : '#71717a', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: '2px 4px' }}
                >⚙</button>
                {showSettings && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: '#27272a', border: '1px solid #3f3f46', borderRadius: 6, padding: 4, zIndex: 10001, minWidth: 110 }}>
                    <div style={{ color: '#52525b', fontSize: 9, letterSpacing: '0.1em', padding: '4px 8px 6px' }}>POSITION</div>
                    {POSITIONS.map(p => (
                      <button key={p.key} onClick={() => { setPanelPos(p.key); setShowSettings(false) }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: panelPos === p.key ? 'rgba(99,102,241,0.15)' : 'none', border: 'none', color: panelPos === p.key ? '#a5b4fc' : '#a1a1aa', padding: '5px 10px', cursor: 'pointer', fontSize: 10, fontFamily: 'monospace', borderRadius: 4 }}>
                        <span style={{ fontSize: 8 }}>{p.icon}</span> {p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>✕</button>
            </div>
          </div>

          {/* Body — row for top/bottom, column for left/right */}
          <div style={{ flex: 1, display: 'flex', flexDirection: isHorizontal ? 'row' : 'column', overflow: 'hidden' }}>
            {treeContent}
            {!isHorizontal && <div style={{ height: 1, background: '#3f3f46', margin: '4px 0', flexShrink: 0 }} />}
            {propertiesContent}
          </div>

        </div>
      )}
    </div>
  )
}
