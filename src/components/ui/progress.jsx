import React from 'react'

export function Progress({ value = 0, className = '' }) {
  return (
    <div
      className={`relative h-2 w-full rounded-full bg-gray-200 ${className}`}
    >
      <div
        className="absolute top-0 left-0 h-2 rounded-full bg-blue-600 transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
