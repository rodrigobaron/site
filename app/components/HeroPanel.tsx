// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'

/* Feedforward neural net: 4 input → 5 hidden → 3 output, fully connected */
const NN_INPUT = [40, 80, 120, 160]
const NN_HIDDEN = [30, 65, 100, 135, 170]
const NN_OUTPUT = [60, 100, 140]

export function HeroPanel() {
  // random training progress per page load (20–80%); starts at a fixed
  // value so server and client render the same HTML, then rolls on mount
  const [pct, setPct] = useState(null)
  useEffect(() => {
    setPct(20 + Math.floor(Math.random() * 61))
  }, [])

  const shown = pct ?? 50
  const epoch = String(Math.max(1, Math.round(shown / 10))).padStart(2, '0')

  return (
    <div className='hero-visual'>
      <div className='hv-chrome'>
        <span className='chrome-dots'><i /><i /><i /></span>
        <span>nn.training — epoch {pct === null ? '——' : epoch}/10</span>
      </div>
      <svg className='hv-net' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <g stroke='#00CCCC' strokeOpacity='0.35' strokeWidth='0.5'>
          {NN_INPUT.map(y1 =>
            NN_HIDDEN.map(y2 => (
              <line key={`a${y1}-${y2}`} x1='35' y1={y1} x2='100' y2={y2} />
            ))
          )}
          {NN_HIDDEN.map(y1 =>
            NN_OUTPUT.map(y2 => (
              <line key={`b${y1}-${y2}`} x1='100' y1={y1} x2='165' y2={y2} />
            ))
          )}
        </g>

        {/* forward-pass pulses */}
        <g fill='#00FFFF'>
          {[
            { d: 'M35,40 L100,65', dur: '2.2s', begin: '0s' },
            { d: 'M35,120 L100,100', dur: '2.6s', begin: '0.9s' },
            { d: 'M35,160 L100,170', dur: '2.4s', begin: '1.5s' },
            { d: 'M100,65 L165,60', dur: '2s', begin: '0.5s' },
            { d: 'M100,135 L165,140', dur: '2.3s', begin: '1.2s' },
            { d: 'M100,30 L165,100', dur: '2.8s', begin: '1.8s' },
          ].map((p, i) => (
            <circle key={i} r='1.8'>
              <animateMotion dur={p.dur} begin={p.begin} repeatCount='indefinite' path={p.d} />
            </circle>
          ))}
        </g>

        <g fill='#CCCCCC'>
          {NN_INPUT.map(y => <circle key={y} cx='35' cy={y} r='3.2' />)}
        </g>
        <g fill='#00CCCC'>
          {NN_HIDDEN.map(y => <circle key={y} cx='100' cy={y} r='3.2' />)}
        </g>
        <g fill='#00FFFF'>
          {NN_OUTPUT.map(y => <circle key={y} cx='165' cy={y} r='3.6' />)}
        </g>
      </svg>
      <div className='hv-foot'>
        <span>training</span>
        <span className='hv-bar'><i style={{ width: `${shown}%` }} /></span>
        <span className='hv-pct'>{pct === null ? '——%' : `${pct}%`}</span>
      </div>
    </div>
  )
}
