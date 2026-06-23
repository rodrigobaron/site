// @ts-nocheck
import Image from 'next/image'

export function HeroPanel() {
  return (
    <div className='hero-visual'>
      {/* duotone filter: maps the grayscale photo into the cyan theme
          (shadows → dark teal, highlights → accent cyan) */}
      <svg className='hv-defs' aria-hidden='true' xmlns='http://www.w3.org/2000/svg'>
        <filter id='hv-duotone' colorInterpolationFilters='sRGB'>
          <feColorMatrix
            type='matrix'
            values='0.2126 0.7152 0.0722 0 0
                    0.2126 0.7152 0.0722 0 0
                    0.2126 0.7152 0.0722 0 0
                    0      0      0      1 0'
          />
          <feComponentTransfer>
            <feFuncR type='table' tableValues='0.04 0.5' />
            <feFuncG type='table' tableValues='0.09 0.82' />
            <feFuncB type='table' tableValues='0.12 0.9' />
          </feComponentTransfer>
        </filter>
      </svg>

      {/* photo + target reticle frame */}
      <div className='hv-frame'>
        <div className='hv-photo'>
          <Image
            src='/images/general/profile.png'
            alt='Rodrigo Baron'
            fill
            sizes='(max-width: 860px) 420px, 380px'
            className='hv-photo-img'
            priority
          />
        </div>
        {/* camera-style target reticle that IS the frame — sits flush on the photo edges */}
        <svg
          className='hv-reticle'
          viewBox='0 0 158 200'
          fill='none'
          aria-hidden='true'
          preserveAspectRatio='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          {/* dashed frame along the edges */}
          <rect
            x='0'
            y='0'
            width='158'
            height='200'
            stroke='currentColor'
            strokeWidth='1.2'
            strokeDasharray='5 4'
            vectorEffect='non-scaling-stroke'
          />
          {/* solid corner brackets + center-edge ticks */}
          <g stroke='currentColor' strokeWidth='2' strokeLinecap='square'>
            <path d='M0 28 L0 0 L28 0' vectorEffect='non-scaling-stroke' />
            <path d='M130 0 L158 0 L158 28' vectorEffect='non-scaling-stroke' />
            <path d='M158 172 L158 200 L130 200' vectorEffect='non-scaling-stroke' />
            <path d='M28 200 L0 200 L0 172' vectorEffect='non-scaling-stroke' />
            <path d='M79 0 L79 14' vectorEffect='non-scaling-stroke' />
            <path d='M79 200 L79 186' vectorEffect='non-scaling-stroke' />
            <path d='M0 100 L14 100' vectorEffect='non-scaling-stroke' />
            <path d='M158 100 L144 100' vectorEffect='non-scaling-stroke' />
          </g>
        </svg>
      </div>

      {/* target ID nameplate — below the photo, left-aligned */}
      <div className='hv-tag'>
        <span className='hv-tag-key'>ROOT:</span> Rodrigo Baron
      </div>
    </div>
  )
}
