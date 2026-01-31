import { useState } from 'react'
import './App.css'

function generateInsight(energy, focus, stress) {
  const overallScore = (energy + focus + (10 - stress)) / 3

  if (overallScore >= 8) {
    return "You're in the zone today. High energy, sharp focus, low stress — this is your peak state. Use it wisely on your highest-leverage work."
  }

  if (overallScore >= 6) {
    if (stress > 6) {
      return "Good energy and focus, but stress is creeping up. You're productive but running hot. Consider a short break before it catches up with you."
    }
    if (energy < 5) {
      return "Your focus is solid but energy is lagging. You might be running on willpower. A walk, snack, or quick reset could help sustain this."
    }
    if (focus < 5) {
      return "You've got the energy but your mind is scattered. Try closing some tabs — literally and mentally. One thing at a time."
    }
    return "Solid day. You're in a good working state. Not your absolute peak, but steady and sustainable. Keep the momentum going."
  }

  if (overallScore >= 4) {
    if (stress > 7) {
      return "Stress is taking over today. Everything else follows from this. Before pushing through, ask: what's one thing you can take off your plate?"
    }
    if (energy < 4 && focus < 4) {
      return "Low battery across the board. This isn't a day for big decisions or creative leaps. Handle the essentials and protect your recovery time."
    }
    return "Mixed signals today. You're functioning but not thriving. Be honest about what's realistic and prioritize ruthlessly."
  }

  if (stress > 8) {
    return "You're in the red zone. High stress with depleted resources is unsustainable. The most founder-like thing you can do right now is step back and recharge."
  }

  return "Rough day. Low energy, scattered focus, or high stress — maybe all three. This is a signal, not a failure. Rest isn't optional; it's strategic."
}

function getScoreColor(score, isStress = false) {
  if (isStress) {
    if (score <= 3) return '#22c55e'
    if (score <= 6) return '#eab308'
    return '#ef4444'
  }
  if (score >= 7) return '#22c55e'
  if (score >= 4) return '#eab308'
  return '#ef4444'
}

function getScoreLabel(score, type) {
  if (type === 'stress') {
    if (score <= 3) return 'Low'
    if (score <= 6) return 'Moderate'
    return 'High'
  }
  if (score >= 7) return 'High'
  if (score >= 4) return 'Moderate'
  return 'Low'
}

function Slider({ label, value, onChange, isStress = false }) {
  const color = getScoreColor(value, isStress)
  const scoreLabel = getScoreLabel(value, isStress ? 'stress' : 'normal')

  return (
    <div className="slider-container">
      <div className="slider-header">
        <label>{label}</label>
        <span className="score-badge" style={{ backgroundColor: color }}>
          {value}/10 · {scoreLabel}
        </span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="slider"
        style={{ '--slider-color': color }}
      />
      <div className="slider-labels">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  )
}

function VisualSummary({ energy, focus, stress }) {
  const metrics = [
    { label: 'Energy', value: energy, isStress: false },
    { label: 'Focus', value: focus, isStress: false },
    { label: 'Stress', value: stress, isStress: true },
  ]

  const overallScore = Math.round((energy + focus + (10 - stress)) / 3 * 10) / 10

  return (
    <div className="visual-summary">
      <div className="summary-bars">
        {metrics.map(({ label, value, isStress }) => (
          <div key={label} className="bar-container">
            <div className="bar-label">{label}</div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${value * 10}%`,
                  backgroundColor: getScoreColor(value, isStress),
                }}
              />
            </div>
            <div className="bar-value">{value}</div>
          </div>
        ))}
      </div>
      <div className="overall-score">
        <div className="overall-label">Overall Wellness</div>
        <div
          className="overall-value"
          style={{ color: getScoreColor(overallScore, false) }}
        >
          {overallScore.toFixed(1)}
        </div>
        <div className="overall-subtitle">out of 10</div>
      </div>
    </div>
  )
}

function App() {
  const [energy, setEnergy] = useState(5)
  const [focus, setFocus] = useState(5)
  const [stress, setStress] = useState(5)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    setSubmitted(true)
  }

  const handleReset = () => {
    setEnergy(5)
    setFocus(5)
    setStress(5)
    setSubmitted(false)
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="app">
      <header className="header">
        <h1>Daily Pulse</h1>
        <p className="date">{today}</p>
      </header>

      {!submitted ? (
        <main className="check-in">
          <p className="intro">Take a moment. How are you really doing today?</p>

          <div className="sliders">
            <Slider
              label="How's your energy?"
              value={energy}
              onChange={setEnergy}
            />
            <Slider
              label="How focused do you feel?"
              value={focus}
              onChange={setFocus}
            />
            <Slider
              label="How stressed are you?"
              value={stress}
              onChange={setStress}
              isStress
            />
          </div>

          <button className="submit-btn" onClick={handleSubmit}>
            Check My Pulse
          </button>
        </main>
      ) : (
        <main className="results">
          <VisualSummary energy={energy} focus={focus} stress={stress} />

          <div className="insight-card">
            <h2>Your Insight</h2>
            <p>{generateInsight(energy, focus, stress)}</p>
          </div>

          <button className="reset-btn" onClick={handleReset}>
            Check In Again
          </button>
        </main>
      )}
    </div>
  )
}

export default App
