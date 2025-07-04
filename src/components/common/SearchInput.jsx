import { Search } from 'lucide-react'
import { Input } from '../ui/input'

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = '검색...', 
  className = '',
  onEnter 
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onEnter) {
      onEnter(value)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        className="pl-10"
      />
    </div>
  )
}