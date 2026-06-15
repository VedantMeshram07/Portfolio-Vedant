import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const CURSOR_BLUE         = '#3b82f6'   // var(--color-electric-blue)
const CURSOR_VIVID_ORANGE = '#FF7A2B'   // used during difference blend hover

/**
 * Cursor.jsx — Luminance-adaptive blue/orange, difference blend on hover
 * -----------------------------------------------------------------------
 *  Default: luminance-based colour switching.
 *    • Cement (#D4D3D0) backgrounds → BLUE dot, 1× scale, no blend.
 *    • Obsidian (#0A0A0A) backgrounds → ORANGE dot, 1× scale, no blend.
 *
 *  Hover (data-cursor="hover", a, button, …):
 *    • 3× scale + mix-blend-mode:difference + vivid orange.
 *    • Applied consistently to ALL interactive elements site-wide.
 *
 *  Name exception (data-cursor="name"):
 *    • No blend, 0.6× scale, BLUE dot — so the nameplate stays readable.
 *
 *  State machine (default | hover | name) prevents redundant GSAP calls
 *  on every pointerover tick.
 * -----------------------------------------------------------------------
 */

// Walk up the DOM to find the first real background colour.
const getEffectiveBg = (el) => {
  let cur = el
  while (cur && cur !== document.documentElement) {
    const bg = getComputedStyle(cur).backgroundColor
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg
    cur = cur.parentElement
  }
  return getComputedStyle(document.body).backgroundColor
}

// Average RGB → 0-255 luminance. > 128 = light, ≤ 128 = dark.
const getLuminance = (bg) => {
  const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!m) return 255
  return (parseInt(m[1]) + parseInt(m[2]) + parseInt(m[3])) / 3
}

const HOVER_SEL = '[data-cursor="hover"], a, button, [role="button"], [role="link"]'
const NAME_SEL  = '[data-cursor="name"]'

const Cursor = ({ active = false }) => {
  const dotRef   = useRef(null)
  const posRef   = useRef({ x: 0, y: 0 })
  const tgtRef   = useRef({ x: 0, y: 0 })
  const stateRef = useRef('default')   // 'default' | 'hover' | 'name'
  const tickRef  = useRef(null)

  useEffect(() => {
    if (!active) return
    const dot = dotRef.current
    if (!dot) return

    // ── Snap to centre on handoff from Awakening preloader ────────────
    const cx = window.innerWidth  / 2
    const cy = window.innerHeight / 2
    posRef.current = { x: cx, y: cy }
    tgtRef.current = { x: cx, y: cy }

    gsap.set(dot, {
      x: cx, y: cy,
      xPercent: -50, yPercent: -50,
      scale: 1,
      backgroundColor: CURSOR_BLUE,
    })
    dot.style.mixBlendMode = ''

    // ── Mouse tracking ────────────────────────────────────────────────
    const onMove = (e) => {
      tgtRef.current.x = e.clientX
      tgtRef.current.y = e.clientY
    }

    // ── Lerp ticker ───────────────────────────────────────────────────
    const tick = () => {
      posRef.current.x += (tgtRef.current.x - posRef.current.x) * 0.14
      posRef.current.y += (tgtRef.current.y - posRef.current.y) * 0.14
      gsap.set(dot, { x: posRef.current.x, y: posRef.current.y })
    }
    gsap.ticker.add(tick)
    tickRef.current = tick

    // ── State setters ─────────────────────────────────────────────────

    const setDefault = (target) => {
      if (stateRef.current === 'default') return
      stateRef.current = 'default'
      dot.style.mixBlendMode = ''
      gsap.to(dot, {
        scale: 1,
        backgroundColor: CURSOR_BLUE,
        duration: 0.32, ease: 'power2.out',
      })
    }

    const setHover = () => {
      if (stateRef.current === 'hover') return
      stateRef.current = 'hover'
      dot.style.mixBlendMode = 'difference'
      gsap.to(dot, {
        scale: 3,
        backgroundColor: CURSOR_VIVID_ORANGE,
        duration: 0.28, ease: 'power2.out',
      })
    }

    const setName = () => {
      if (stateRef.current === 'name') return
      stateRef.current = 'name'
      dot.style.mixBlendMode = ''
      gsap.to(dot, {
        scale: 0.65,
        backgroundColor: CURSOR_BLUE,
        duration: 0.22, ease: 'power2.out',
      })
    }

    // ── Pointer events ────────────────────────────────────────────────

    const onPointerOver = (e) => {
      const t = e.target
      if (!t) return

      if (t.closest?.(NAME_SEL)) {
        setName()
      } else if (t.closest?.(HOVER_SEL)) {
        setHover()
      } else {
        // Update default colour as cursor moves between backgrounds
        if (stateRef.current === 'default') {
          gsap.to(dot, { backgroundColor: CURSOR_BLUE, duration: 0.28, ease: 'power2.inOut' })
        } else {
          setDefault(t)
        }
      }
    }

    const onPointerOut = (e) => {
      const rel = e.relatedTarget
      if (!rel) { setDefault(e.target); return }
      if (!rel.closest?.(HOVER_SEL) && !rel.closest?.(NAME_SEL)) {
        setDefault(rel)
      }
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('pointerover', onPointerOver)
    document.addEventListener('pointerout',  onPointerOut)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('pointerover', onPointerOver)
      document.removeEventListener('pointerout',  onPointerOut)
      if (tickRef.current) gsap.ticker.remove(tickRef.current)
    }
  }, [active])

  if (!active) return null

  return (
    <div
      ref={dotRef}
      className="pointer-events-none fixed top-0 left-0 z-[9999] w-4 h-4 rounded-full"
      style={{ backgroundColor: CURSOR_BLUE }}
    />
  )
}

export default Cursor