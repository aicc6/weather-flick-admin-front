import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function LinkButton({
  variant,
  size,
  className,
  href,
  to,
  children,
  ...props
}) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link to={to || href} {...props}>
        {children}
      </Link>
    </Button>
  )
}
