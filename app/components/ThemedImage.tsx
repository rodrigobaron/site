// @ts-nocheck
import Image from 'next/image'

export function ThemedImage({ className = '', ...props }) {
  return <Image {...props} className={`themed-image ${className}`.trim()} />
}
