import { useState, type ReactNode } from 'react'

export function Panel({
  title,
  children,
  extra,
  className,
}: {
  title: string
  children: ReactNode
  extra?: ReactNode
  className?: string
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <section className={`panel${className ? ` ${className}` : ''}${collapsed ? ' collapsed' : ''}`}>
      <div className="panel-header" onClick={() => setCollapsed((c) => !c)}>
        <h2>{title}</h2>
        <div className="panel-header-right">
          {extra && <div onClick={(e) => e.stopPropagation()}>{extra}</div>}
          <span className="collapse-chevron">{collapsed ? '▸' : '▾'}</span>
        </div>
      </div>
      {!collapsed && <div className="panel-body">{children}</div>}
    </section>
  )
}
