import { useState } from 'react'

export function Accordion({ children, type = 'single', collapsible = true }) {
  // type: 'single'만 지원, collapsible: true만 지원
  return <div className="divide-y rounded border bg-white">{children}</div>
}

export function AccordionItem({ value, title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold hover:bg-gray-50 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {title}
        <span className="ml-2 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}
