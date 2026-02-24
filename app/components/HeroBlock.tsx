import Image from 'next/image'

export function HeroBlock() {
  return (
    <div className='hero-block'>
      <Image src='/images/general/logo.svg' alt='logo' width={100} height={100} className='h-fit' />
      <span className='hero-block-text'>
        I&apos;m writing about AI — Agents, Deployment, Serving and Model Fine-tuning.
        Exploring current and next generation AI applications.
      </span>
    </div>
  )
}
