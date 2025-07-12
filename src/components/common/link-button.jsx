import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function LinkButton({ variant, size, className, href, children }) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link href={href}>{children}</Link>
    </Button>
  )
}
