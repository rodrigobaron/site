import Image from 'next/image'

export function HeroBlock() {
  return (
    <div className='hero-block'>
      <Image src='/images/general/vibe-notes.svg' alt='Vibe Notes' width={400} height={400} className='h-fit' />
      <span className='hero-block-text'>
        Machine Learning Developer Notes — Building, Optimizing, Serving, and Scaling
      </span>
    </div>
  )
}
