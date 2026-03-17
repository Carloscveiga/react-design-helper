import { useEffect, useRef, useState } from 'react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rgbToHex(rgb) {
  if (!rgb || rgb === 'transparent') return '#ffffff'
  if (/rgba\(\d+,\s*\d+,\s*\d+,\s*0\b/.test(rgb)) return '#ffffff'
  const m = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/)
  if (!m) return '#000000'
  return '#' + [m[1], m[2], m[3]].map(n => parseInt(n).toString(16).padStart(2, '0')).join('')
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
  { key: 'gap', label: 'Gap', group: 'Layout', type: 'range', min: 0, max: 64, unit: 'px',
    cond: s => s.display.includes('flex') || s.display === 'grid',
    get: s => String(px(s.gap)), set: (el, v) => { el.style.gap = `${v}px` } },
  // Sizing
  { key: 'width', label: 'Width', group: 'Sizing', type: 'size',
    get: s => s.width, set: (el, v) => { el.style.width = v } },
  { key: 'height', label: 'Height', group: 'Sizing', type: 'size',
    get: s => s.height, set: (el, v) => { el.style.height = v } },
  { key: 'maxWidth', label: 'Max Width', group: 'Sizing', type: 'size',
    get: s => s.maxWidth, set: (el, v) => { el.style.maxWidth = v } },
  { key: 'minHeight', label: 'Min Height', group: 'Sizing', type: 'size',
    get: s => s.minHeight, set: (el, v) => { el.style.minHeight = v } },
  // Padding
  { key: 'paddingTop', label: 'Top', group: 'Padding', type: 'range', min: 0, max: 120, unit: 'px',
    get: s => String(px(s.paddingTop)), set: (el, v) => { el.style.paddingTop = `${v}px` } },
  { key: 'paddingRight', label: 'Right', group: 'Padding', type: 'range', min: 0, max: 120, unit: 'px',
    get: s => String(px(s.paddingRight)), set: (el, v) => { el.style.paddingRight = `${v}px` } },
  { key: 'paddingBottom', label: 'Bottom', group: 'Padding', type: 'range', min: 0, max: 120, unit: 'px',
    get: s => String(px(s.paddingBottom)), set: (el, v) => { el.style.paddingBottom = `${v}px` } },
  { key: 'paddingLeft', label: 'Left', group: 'Padding', type: 'range', min: 0, max: 120, unit: 'px',
    get: s => String(px(s.paddingLeft)), set: (el, v) => { el.style.paddingLeft = `${v}px` } },
  // Margin
  { key: 'marginTop', label: 'Top', group: 'Margin', type: 'range', min: -64, max: 120, unit: 'px',
    get: s => String(px(s.marginTop)), set: (el, v) => { el.style.marginTop = `${v}px` } },
  { key: 'marginBottom', label: 'Bottom', group: 'Margin', type: 'range', min: -64, max: 120, unit: 'px',
    get: s => String(px(s.marginBottom)), set: (el, v) => { el.style.marginBottom = `${v}px` } },
  // Typography
  { key: 'fontSize', label: 'Size', group: 'Typography', type: 'range', min: 8, max: 96, unit: 'px',
    get: s => String(px(s.fontSize)), set: (el, v) => { el.style.fontSize = `${v}px` } },
  { key: 'fontWeight', label: 'Weight', group: 'Typography', type: 'select',
    options: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    get: s => s.fontWeight, set: (el, v) => { el.style.fontWeight = v } },
  { key: 'lineHeight', label: 'Line Height', group: 'Typography', type: 'text',
    get: s => s.lineHeight, set: (el, v) => { el.style.lineHeight = v } },
  { key: 'textAlign', label: 'Align', group: 'Typography', type: 'select',
    options: ['left', 'center', 'right', 'justify'],
    get: s => s.textAlign, set: (el, v) => { el.style.textAlign = v } },
  { key: 'letterSpacing', label: 'Tracking', group: 'Typography', type: 'text',
    get: s => s.letterSpacing, set: (el, v) => { el.style.letterSpacing = v } },
  // Colors
  { key: 'backgroundColor', label: 'Background', group: 'Colors', type: 'color',
    get: s => rgbToHex(s.backgroundColor), set: (el, v) => { el.style.backgroundColor = v } },
  { key: 'color', label: 'Text', group: 'Colors', type: 'color',
    get: s => rgbToHex(s.color), set: (el, v) => { el.style.color = v } },
  { key: 'backgroundImage', label: 'Bg Image', group: 'Colors', type: 'image',
    get: s => s.backgroundImage, set: (el, v) => { el.style.backgroundImage = v } },
  { key: 'backgroundSize', label: 'Bg Size', group: 'Colors', type: 'select',
    options: ['cover', 'contain', 'auto', '100% 100%', '50%', '100%'],
    cond: s => s.backgroundImage !== 'none',
    get: s => s.backgroundSize, set: (el, v) => { el.style.backgroundSize = v } },
  { key: 'backgroundPosition', label: 'Bg Pos', group: 'Colors', type: 'select',
    options: ['center', 'top', 'bottom', 'left', 'right', 'top center', 'bottom center'],
    cond: s => s.backgroundImage !== 'none',
    get: s => s.backgroundPosition, set: (el, v) => { el.style.backgroundPosition = v } },
  { key: 'backgroundRepeat', label: 'Bg Repeat', group: 'Colors', type: 'select',
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

const GROUPS = ['Layout', 'Sizing', 'Padding', 'Margin', 'Typography', 'Colors', 'Border', 'Effects']

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
      </div>
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

function PropRow({ prop, value, onChange }) {
  const isSize = prop.type === 'size'
  return (
    <div style={{ display: 'flex', alignItems: isSize ? 'flex-start' : 'center', gap: 6, padding: isSize ? '8px 0' : '3px 0', minHeight: 26 }}>
      <span style={{ width: 74, fontSize: 10, color: '#71717a', fontFamily: 'monospace', flexShrink: 0, paddingTop: isSize ? 5 : 0 }}>
        {prop.label}
      </span>

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
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EditHelper() {
  const wrapRef = useRef(null)
  const [open, setOpen] = useState(false)

  // Auto-set positioning context on parent if missing, so no need for `relative` class
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
  const [collapsed, setCollapsed] = useState(new Set())
  const prevHighlight = useRef(null)

  // Build tree when panel opens
  useEffect(() => {
    if (!open || !wrapRef.current) return
    const parent = wrapRef.current.parentElement
    if (!parent) return

    const children = []
    walk(parent, wrapRef.current, 1, children, { n: 1 })

    const all = [{ id: 0, el: parent, depth: 0 }, ...children]
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
    setVals(readVals(node.el))
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

  function toggleGroup(g) {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(g)) next.delete(g); else next.add(g)
      return next
    })
  }

  const selectedNode = nodes.find(n => n.id === selId)
  const computedStyles = selectedNode ? getComputedStyle(selectedNode.el) : null

  return (
    <div ref={wrapRef} style={{ position: 'absolute', top: 10, right: 10, zIndex: 9999 }}>
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
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 320, background: '#18181b',
          borderLeft: '1px solid #3f3f46',
          display: 'flex', flexDirection: 'column',
          fontFamily: 'monospace', fontSize: 11,
          boxShadow: '-8px 0 32px rgba(0,0,0,0.5)',
          zIndex: 9999,
        }}>

          {/* Header */}
          <div style={{
            padding: '12px 14px 10px', borderBottom: '1px solid #3f3f46',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ color: '#e4e4e7', letterSpacing: '0.1em', fontSize: 11 }}>◈ INSPECTOR</span>
            <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>✕</button>
          </div>

          {/* Tree */}
          <div style={{ padding: '8px 14px 4px' }}>
            <div style={{ color: '#52525b', letterSpacing: '0.1em', fontSize: 9, marginBottom: 6 }}>TREE</div>
            <div style={{ overflowY: 'auto', maxHeight: 200 }}>
              {nodes.map(node => (
                <div
                  key={node.id}
                  onClick={() => selectNode(node)}
                  style={{
                    paddingLeft: 4 + node.depth * 10,
                    paddingTop: 3, paddingBottom: 3, paddingRight: 4,
                    color: node.id === selId ? '#a5b4fc' : '#71717a',
                    background: node.id === selId ? 'rgba(99,102,241,0.12)' : 'transparent',
                    cursor: 'pointer', borderRadius: 4,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    fontSize: 11,
                  }}
                >
                  {node.depth > 0 ? '└ ' : ''}{nodeLabel(node.el)}
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: '#3f3f46', margin: '4px 0' }} />

          {/* Properties */}
          {selectedNode && computedStyles && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '6px 14px 16px' }}>
              <div style={{ color: '#a5b4fc', fontSize: 11, marginBottom: 10, letterSpacing: '0.05em' }}>
                &lt;{selectedNode.el.tagName.toLowerCase()}&gt;
              </div>

              {GROUPS.map(group => {
                const groupProps = PROPS.filter(p =>
                  p.group === group && (!p.cond || p.cond(computedStyles))
                )
                if (!groupProps.length) return null
                const isCollapsed = collapsed.has(group)
                return (
                  <div key={group} style={{ marginBottom: 6 }}>
                    <div
                      onClick={() => toggleGroup(group)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        color: '#52525b', fontSize: 9, letterSpacing: '0.1em',
                        cursor: 'pointer', padding: '4px 0', userSelect: 'none',
                      }}
                    >
                      <span style={{ fontSize: 8 }}>{isCollapsed ? '▶' : '▼'}</span>
                      {group.toUpperCase()}
                    </div>
                    {!isCollapsed && (
                      <div style={{ paddingLeft: 2 }}>
                        {groupProps.map(prop => (
                          <PropRow
                            key={prop.key}
                            prop={prop}
                            value={vals[prop.key] ?? ''}
                            onChange={v => applyProp(prop, v)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
