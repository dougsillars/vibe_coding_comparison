import { useEffect, useMemo, useState } from 'react'

type Pulse = {
  energy: number
  focus: number
  stress: number
}

type StoredPulse = Pulse & {
  savedAt: string
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

const todayKey = () => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `daily-pulse:${yyyy}-${mm}-${dd}`
}

const parseStored = (raw: string | null): StoredPulse | null => {
  if (!raw) return null
  try {
    const obj = JSON.parse(raw) as Partial<StoredPulse>
    if (
      typeof obj.energy !== 'number' ||
      typeof obj.focus !== 'number' ||
      typeof obj.stress !== 'number' ||
      typeof obj.savedAt !== 'string'
    ) {
      return null
    }
    return {
      energy: clamp(obj.energy, 0, 10),
      focus: clamp(obj.focus, 0, 10),
      stress: clamp(obj.stress, 0, 10),
      savedAt: obj.savedAt,
    }
  } catch {
    return null
  }
}

const insightFor = ({ energy, focus, stress }: Pulse) => {
  if (energy <= 3 && stress >= 7) {
    return 'Your stress is high while your energy is low. Consider a short reset: a walk, a snack, and picking one “must-do” task.'
  }
  if (focus <= 3 && stress >= 7) {
    return 'You’re feeling stressed and unfocused. Try reducing scope: write the next smallest step and do only that for 15 minutes.'
  }
  if (energy >= 7 && focus >= 7 && stress <= 3) {
    return 'You’re in a strong place: high energy, high focus, low stress. This is a great moment for deep work or hard decisions.'
  }
  if (energy <= 3 && focus <= 3) {
    return 'Energy and focus are both low. Aim for recovery or light admin work, and protect your next sleep window.'
  }
  if (stress >= 7) {
    return 'Stress is elevated. A quick brain dump and a single clear priority can help you regain control.'
  }
  if (focus >= 7) {
    return 'Focus is strong today. Block a short uninterrupted session and ship something small end-to-end.'
  }
  if (energy >= 7) {
    return 'Energy is high. Use it to tackle a high-leverage task early, before context-switching.'
  }
  return 'A steady day. Pick one meaningful outcome and keep the bar for “done” very clear.'
}

const scoreFor = ({ energy, focus, stress }: Pulse) => {
  const base = (energy + focus + (10 - stress)) / 3
  return Math.round(base * 10)
}

function Meter({ label, value, tone }: { label: string; value: number; tone: 'good' | 'warn' | 'bad' }) {
  const pct = clamp(value, 0, 10) * 10
  return (
    <div className="meter">
      <div className="meterLabelRow">
        <div className="meterLabel">{label}</div>
        <div className="meterValue">{value}/10</div>
      </div>
      <div className="meterTrack" role="img" aria-label={`${label} ${value} out of 10`}>
        <div className={`meterFill ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function SliderRow({
  label,
  value,
  onChange,
  helper,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  helper: string
}) {
  return (
    <div className="sliderRow">
      <div className="sliderHeader">
        <div className="sliderLabel">{label}</div>
        <div className="sliderNumber">{value}</div>
      </div>
      <input
        className="slider"
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="sliderHelper">{helper}</div>
    </div>
  )
}

export default function App() {
  const [energy, setEnergy] = useState(6)
  const [focus, setFocus] = useState(6)
  const [stress, setStress] = useState(4)

  const [saved, setSaved] = useState<StoredPulse | null>(null)

  useEffect(() => {
    const stored = parseStored(localStorage.getItem(todayKey()))
    if (!stored) return
    setEnergy(stored.energy)
    setFocus(stored.focus)
    setStress(stored.stress)
    setSaved(stored)
  }, [])

  const pulse: Pulse = useMemo(() => ({ energy, focus, stress }), [energy, focus, stress])
  const score = useMemo(() => scoreFor(pulse), [pulse])
  const insight = useMemo(() => insightFor(pulse), [pulse])

  const save = () => {
    const stored: StoredPulse = {
      energy,
      focus,
      stress,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(todayKey(), JSON.stringify(stored))
    setSaved(stored)
  }

  const clear = () => {
    localStorage.removeItem(todayKey())
    setSaved(null)
  }

  const toneEnergy: 'good' | 'warn' | 'bad' = energy >= 7 ? 'good' : energy >= 4 ? 'warn' : 'bad'
  const toneFocus: 'good' | 'warn' | 'bad' = focus >= 7 ? 'good' : focus >= 4 ? 'warn' : 'bad'
  const toneStress: 'good' | 'warn' | 'bad' = stress <= 3 ? 'good' : stress <= 6 ? 'warn' : 'bad'

  return (
    <div className="page">
      <div className="container">
        <header className="header">
          <div>
            <div className="title">Daily Pulse</div>
            <div className="subtitle">Three quick inputs. A clear snapshot.</div>
          </div>
          <div className="badge" aria-label={`Pulse score ${score} out of 100`}>
            <div className="badgeLabel">Pulse</div>
            <div className="badgeValue">{score}</div>
          </div>
        </header>

        <main className="grid">
          <section className="card">
            <div className="cardTitle">Today’s check-in</div>

            <SliderRow
              label="How’s your energy?"
              value={energy}
              onChange={setEnergy}
              helper="0 = empty, 10 = fully charged"
            />
            <SliderRow
              label="How focused do you feel?"
              value={focus}
              onChange={setFocus}
              helper="0 = scattered, 10 = locked in"
            />
            <SliderRow
              label="How stressed are you?"
              value={stress}
              onChange={setStress}
              helper="0 = calm, 10 = overwhelmed"
            />

            <div className="actions">
              <button className="button primary" onClick={save}>
                Save today
              </button>
              <button className="button" onClick={clear}>
                Clear
              </button>
            </div>

            {saved ? (
              <div className="savedRow">
                Saved at {new Date(saved.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            ) : (
              <div className="savedRow">Not saved yet</div>
            )}
          </section>

          <section className="card">
            <div className="cardTitle">Snapshot</div>
            <div className="meters">
              <Meter label="Energy" value={energy} tone={toneEnergy} />
              <Meter label="Focus" value={focus} tone={toneFocus} />
              <Meter label="Stress" value={stress} tone={toneStress} />
            </div>

            <div className="insight">
              <div className="insightTitle">Insight</div>
              <div className="insightBody">{insight}</div>
            </div>
          </section>
        </main>

        <footer className="footer">
          <div className="footerText">Tip: do this at the same time each day to spot trends.</div>
        </footer>
      </div>
    </div>
  )
}
