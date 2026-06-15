/**
 * RightColumn.jsx — Phase 1.9b: The Subtle-Flicker State Machine
 * --------------------------------------------------------------------
 *  Two states. The third one (heavy GLITCHING) is gone.
 *
 *    QUIET       — the editorial layout. Three minimalist dots at the
 *                  top, the elegant Serif quote at the bottom. While
 *                  the user reads, a 4-6s cycle of micro-flickers runs
 *                  to invite interaction:
 *                    • a random dot flashes red (frequent)
 *                    • one random char in the quote stutters to a
 *                      random glyph + electric orange (occasional, but
 *                      noticeable)
 *
 *    TERMINAL    — click anywhere on the column. All flicker timers
 *                  are atomically cleared, any in-flight char swap is
 *                  restored to the original glyph, then the quote
 *                  words shatter (~300ms) before the DOM pivots to
 *                  a Monospace terminal.
 *
 *  All async work (cycle scheduler, individual flicker ticks, char
 *  stutter ticks, typewriter chars) is tracked in a `timeoutsRef`
 *  Set so the click handler can cancel the entire loop atomically
 *  before the shatter.
 * --------------------------------------------------------------------
 */
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const PARAGRAPH =
  'A walkthrough of systems, experiments, and ideas that made it out of my head and into the real world.'

// Pool used by the char-flicker. Deliberately not alphabet-only — includes
// symbols so a flicker reads as "system noise", not "typo".
const FLICKER_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/'

// Live IST timestamp for the top-right label of the black column.
// "Asia/Kolkata" is the IANA zone for Nagpur (UTC+5:30, no DST).
// Returns e.g. "8:26:48 PM IST" — the trailing "IST" is appended
// manually for the server-monitoring aesthetic.
const formatNagpurTime = () => {
  const t = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
  return `${t} IST`
}

// ───────────────────────────────────────────────────────────────────
//  RightColumn
// ───────────────────────────────────────────────────────────────────
const RightColumn = () => {
  const [panelState, setPanelState] = useState('QUIET') // 'QUIET' | 'TERMINAL'
  // Live IST clock for the top-right label. Lazy init so we compute
  // the value once, not on every re-render.
  const [time, setTime] = useState(() => formatNagpurTime())

  const containerRef = useRef(null)
  const contentRef = useRef(null)
  const wordRefs = useRef([])
  const dotRefs = useRef([])
  const timeoutsRef = useRef(new Set()) // every async id we create

  const words = PARAGRAPH.split(' ')

  // ── Effect 1: word-by-word reveal of the quote. Re-runs whenever
  //    panelState becomes 'QUIET' (initial mount + after `exit` from
  //    the terminal), so the entrance animation replays every time
  //    the user comes back to normal mode.
  useEffect(() => {
    if (panelState !== 'QUIET') return
    let ctx
    document.fonts.ready.then(() => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          wordRefs.current,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.035,
            delay: 0.95,
          },
        )
      })
    })
    return () => ctx?.revert()
  }, [panelState])

  // ── Effect 2: flicker cycle. Only active while panelState === 'QUIET'.
  //    A 4-6s "cycle" is scheduled; inside each cycle, 2-4 micro-events
  //    fire at random offsets. 70% of events are dot flickers (the
  //    "often" kind); 30% are char flickers (the "not very often but
  //    noticeable" kind).
  useEffect(() => {
    if (panelState !== 'QUIET') return

    let cancelled = false

    const triggerDotFlicker = () => {
      if (cancelled) return
      const dotEls = dotRefs.current.filter(Boolean)
      if (dotEls.length === 0) return
      const dot = dotEls[Math.floor(Math.random() * dotEls.length)]

      // Flash to electric red with a glow, then ease back to the
      // inherited cement/40. The scale bump gives it a tactile snap.
      gsap.fromTo(
        dot,
        { color: '#ff4d00', scale: 1.45, textShadow: '0 0 8px #ff4d00' },
        {
          color: '',
          scale: 1,
          textShadow: 'none',
          duration: 0.35,
          ease: 'power2.out',
        },
      )
    }

    const triggerCharFlicker = () => {
      if (cancelled || !contentRef.current) return
      const wordEls = Array.from(contentRef.current.querySelectorAll('.word'))
      if (wordEls.length === 0) return

      // Pick a word that has at least one non-space glyph.
      const candidates = wordEls.filter((el) => {
        const t = el.dataset.original || el.textContent
        return t && /[^\s ]/.test(t)
      })
      if (candidates.length === 0) return

      const wordEl = candidates[Math.floor(Math.random() * candidates.length)]
      const text = wordEl.dataset.original || wordEl.textContent
      if (!wordEl.dataset.original) wordEl.dataset.original = text

      // Pick a random non-space char position.
      const positions = []
      for (let i = 0; i < text.length; i++) {
        if (text[i] !== ' ' && text[i] !== ' ') positions.push(i)
      }
      if (positions.length === 0) return
      const charIdx = positions[Math.floor(Math.random() * positions.length)]

      // Four stutters (80ms apart) of a random glyph, then restore.
      // Reads as "system noise" with enough beats to feel intentional,
      // not a typo.
      const totalStutters = 4
      const stutterGap = 80
      let count = 0

      const tick = () => {
        if (cancelled) {
          // Leaving QUIET — restore the original glyph cleanly.
          wordEl.textContent = text
          return
        }
        if (count >= totalStutters) {
          wordEl.textContent = text
          return
        }
        const glyph = FLICKER_CHARS[Math.floor(Math.random() * FLICKER_CHARS.length)]
        wordEl.textContent = text.slice(0, charIdx) + glyph + text.slice(charIdx + 1)
        count++
        const id = setTimeout(tick, stutterGap)
        timeoutsRef.current.add(id)
      }

      // Flash the whole word to electric red with a glow + a touch of
      // scale. Longer duration + slower decay (`power3.out`) so the
      // red actually lingers long enough to read as "the word is
      // under stress" rather than a 1-frame blip.
      gsap.fromTo(
        wordEl,
        {
          color: '#ff4d00',
          scale: 1.06,
          textShadow: '0 0 8px rgba(255, 77, 0, 0.55)',
        },
        {
          color: '',
          scale: 1,
          textShadow: 'none',
          duration: 0.7,
          ease: 'power3.out',
        },
      )

      tick()
    }

    const scheduleCycle = () => {
      if (cancelled) return

      const cycleLength = 4000 + Math.random() * 2000 // 4–6s

      // 2–4 micro-events scattered through the cycle.
      const eventCount = 2 + Math.floor(Math.random() * 3)
      for (let i = 0; i < eventCount; i++) {
        const delay = Math.random() * cycleLength
        // Weighted: 70% dot, 30% char.
        const isDot = Math.random() < 0.7
        const id = setTimeout(() => {
          if (cancelled) return
          if (isDot) triggerDotFlicker()
          else triggerCharFlicker()
        }, delay)
        timeoutsRef.current.add(id)
      }

      const nextId = setTimeout(scheduleCycle, cycleLength)
      timeoutsRef.current.add(nextId)
    }

    // 5s grace — let the entrance settle before the first flicker.
    const initialId = setTimeout(scheduleCycle, 5000)
    timeoutsRef.current.add(initialId)

    return () => {
      cancelled = true
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current.clear()
    }
  }, [panelState])

  // ── Live IST clock. Ticks every second; cleanup clears the interval
  //    so we don't leak it if the column unmounts mid-tick. The only
  //    DOM node that mutates is the time text in the top-right label.
  useEffect(() => {
    const id = setInterval(() => setTime(formatNagpurTime()), 1000)
    return () => clearInterval(id)
  }, [])

  // ── Click handler: kill the loop, restore any in-flight char swap,
  //    kill any flicker tweens, shatter the quote, pivot to TERMINAL.
  const handleClick = () => {
    if (panelState === 'TERMINAL') return

    // 1. Cancel all pending flicker ticks.
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current.clear()

    // 2. Reset the column's skew (defensive — there isn't one in the
    //    new design, but cheap to keep).
    if (containerRef.current) {
      gsap.killTweensOf(containerRef.current)
      gsap.set(containerRef.current, { skewX: 0 })
    }

    // 3. Stop in-flight flicker tweens, restore original glyphs in
    //    any word that was mid-stutter.
    if (contentRef.current) {
      const wordEls = contentRef.current.querySelectorAll('.word')
      wordEls.forEach((el) => {
        gsap.killTweensOf(el)
        if (el.dataset.original) el.textContent = el.dataset.original
      })
      const dotEls = dotRefs.current.filter(Boolean)
      dotEls.forEach((el) => {
        gsap.killTweensOf(el)
        gsap.set(el, { clearProps: 'color,scale,textShadow' })
      })
    }

    // 4. Shatter every .fragment (one per quote word), then pivot.
    if (contentRef.current) {
      const fragments = contentRef.current.querySelectorAll('.fragment')
      gsap.to(fragments, {
        y: () => 80 + Math.random() * 120,
        x: () => (Math.random() - 0.5) * 80,
        rotation: () => (Math.random() - 0.5) * 30,
        opacity: 0,
        duration: 0.2,
        ease: 'power3.in',
        stagger: 0.006,
        onComplete: () => setPanelState('TERMINAL'),
      })
    } else {
      setPanelState('TERMINAL')
    }
  }

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      data-cursor="hover"
      className="flex flex-col justify-between bg-obsidian text-cement p-6 md:p-8 w-full h-full"
    >
      {/* ── Top row: dots (left) + live IST clock (right) ────────── */}
      <div className="flex items-start justify-between">
        <div className="flex gap-1.5 text-cement/40 text-xs tracking-widest select-none">
          <span ref={(el) => (dotRefs.current[0] = el)}>●</span>
          <span ref={(el) => (dotRefs.current[1] = el)}>●</span>
          <span ref={(el) => (dotRefs.current[2] = el)}>●</span>
        </div>
        <div className="text-right font-sans-brutal uppercase tracking-widest text-cement text-[10px] md:text-xs leading-tight">
          <div>Nagpur, IN</div>
          <div>{time}</div>
        </div>
      </div>

      {/* ── Content area ──────────────────────────────────────────── */}
      <div ref={contentRef} className="mt-4">
        {panelState === 'TERMINAL' ? (
          <Terminal onExit={() => setPanelState('QUIET')} />
        ) : (
          <p
              key="quote"
              className="font-serif-brutal italic text-cement text-xl md:text-2xl lg:text-[1.75rem] leading-[1.35] max-w-[28ch]"
            >
              {words.map((word, i) => (
                <span
                  key={i}
                  ref={(el) => (wordRefs.current[i] = el)}
                  className="word fragment inline-block"
                  style={{ willChange: 'transform, opacity' }}
                >
                  {word}
                  {i < words.length - 1 ? ' ' : ''}
                </span>
              ))}
            </p>
        )}
      </div>
    </div>
  )
}

// ───────────────────────────────────────────────────────────────────
//  Terminal — the post-breach command surface.
//  Self-contained: owns its output/input state, the typewriter boot
//  sequence, and focus management. Renders nothing until mounted, so
//  the user can't type before the boot completes.
//
//  `onExit` is invoked when the user types `exit` — the parent
//  RightColumn then flips panelState back to 'QUIET', unmounts the
//  Terminal, and re-runs the word-by-word reveal of the quote.
// ───────────────────────────────────────────────────────────────────
const Terminal = ({ onExit }) => {
  const [displayLines, setDisplayLines] = useState([]) // typewriter buffer
  const [showPrompt, setShowPrompt] = useState(false)
  const [output, setOutput] = useState([]) // post-boot command history
  const [input, setInput] = useState('')
  const inputRef = useRef(null)
  const scrollRef = useRef(null)

  // ── Typewriter boot sequence
  useEffect(() => {
    const lines = [
      '[SYS_STATUS: OVERRIDE_ACTIVE]',
      '[CORE_AURA: ENGAGED]',
      "> TYPE 'HELP' TO DECRYPT_",
    ]

    let cancelled = false
    let timeoutId

    const typeLine = (lineIdx) => {
      if (cancelled) return
      if (lineIdx >= lines.length) {
        setShowPrompt(true)
        return
      }

      const line = lines[lineIdx]
      let charIdx = 0
      let currentText = ''

      const typeChar = () => {
        if (cancelled) return
        if (charIdx >= line.length) {
          // Pause at the end of the line, then move to the next.
          timeoutId = setTimeout(() => typeLine(lineIdx + 1), 220)
          return
        }
        currentText += line[charIdx]
        setDisplayLines((prev) => {
          const copy = [...prev]
          copy[lineIdx] = currentText
          return copy
        })
        charIdx++
        // Slight jitter per character — feels like a real terminal.
        timeoutId = setTimeout(typeChar, 16 + Math.random() * 20)
      }

      typeChar()
    }

    typeLine(0)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [])

  // ── Focus the invisible input the moment the prompt appears.
  useEffect(() => {
    if (showPrompt && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showPrompt])

  // ── Auto-scroll to the bottom on every new line / keystroke.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [displayLines, output, input])

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return
    const cmd = input.trim()
    setOutput((prev) => [...prev, `> ${input}`])
    setInput('')

    const lower = cmd.toLowerCase()
    if (lower === 'help') {
      setOutput((prev) => [...prev, 'AVAILABLE COMMANDS:'])
      setOutput((prev) => [...prev, '  help    - show this message'])
      setOutput((prev) => [...prev, '  status  - system diagnostics'])
      setOutput((prev) => [...prev, '  about   - who am I'])
      setOutput((prev) => [...prev, '  contact - get in touch'])
      setOutput((prev) => [...prev, '  clear   - clear terminal'])
      setOutput((prev) => [...prev, '  exit    - return to normal mode'])
    } else if (lower === 'exit') {
      setOutput((prev) => [...prev, '[SYS]: DISCONNECTING…'])
      setOutput((prev) => [...prev, '[SYS]: SESSION CLOSED'])
      // Brief delay so the user reads the disconnect line, then pivot.
      setTimeout(() => onExit?.(), 600)
    } else if (lower === 'status') {
      setOutput((prev) => [...prev, '[SYS]: NOMINAL'])
      setOutput((prev) => [...prev, '[CPU]: 12% LOAD'])
      setOutput((prev) => [...prev, '[MEM]: 4.2GB / 16GB'])
    } else if (lower === 'about') {
      setOutput((prev) => [...prev, 'Vedant Meshram — AI & Backend Engineer.'])
      setOutput((prev) => [...prev, 'Building intelligent systems that go beyond.'])
    } else if (lower === 'contact') {
      setOutput((prev) => [...prev, '> vedant.meshram@example.com'])
    } else if (lower === 'clear') {
      setOutput([])
    } else if (cmd === '') {
      // blank enter — just a new prompt
    } else {
      setOutput((prev) => [...prev, `[ERR]: UNKNOWN COMMAND '${cmd}'`])
      setOutput((prev) => [...prev, '> TYPE "HELP" FOR COMMANDS'])
    }
  }

  return (
    <div
      className="flex flex-col h-full font-mono text-cement text-[11px] md:text-xs leading-relaxed"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-0.5 pr-2 min-h-0">
        {displayLines.map((line, i) => (
          <div key={`boot-${i}`} className="whitespace-pre-wrap break-words">{line}</div>
        ))}
        {output.map((line, i) => (
          <div key={`out-${i}`} className="whitespace-pre-wrap break-words">{line}</div>
        ))}
      </div>

      {showPrompt && (
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-electric">{'>'}</span>
          <span>{input}</span>
          <span className="inline-block w-2 h-3 bg-cement animate-pulse ml-px" />
        </div>
      )}

      {/* Invisible input — receives all keystrokes, never seen. */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="opacity-0 absolute w-px h-px"
        autoFocus
        aria-label="Terminal input"
      />
    </div>
  )
}

export default RightColumn
