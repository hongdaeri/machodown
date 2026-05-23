export type MenuRowItem = {
  type: 'action'
  label: string
  kbd?: string
  disabled?: boolean
  checked?: boolean
  action: () => void
}

export type MenuSepItem = { type: 'sep' }
export type MenuLabelItem = { type: 'label'; text: string }
export type MenuItemDef = MenuRowItem | MenuSepItem | MenuLabelItem

interface MenuDropdownProps {
  items: MenuItemDef[]
  onClose: () => void
}

export function MenuDropdown({ items, onClose }: MenuDropdownProps): JSX.Element {
  return (
    <div className="menu-dropdown">
      {items.map((item, i) => {
        if (item.type === 'sep') return <div key={i} className="menu-sep" />
        if (item.type === 'label')
          return (
            <div key={i} className="menu-label">
              {item.text}
            </div>
          )
        return (
          <div
            key={i}
            className={`menu-row${item.disabled ? ' disabled' : ''}${item.checked ? ' checked' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault()
              if (!item.disabled) {
                item.action()
                onClose()
              }
            }}
          >
            <span className="lbl">{item.label}</span>
            {item.kbd && <span className="kbd">{item.kbd}</span>}
          </div>
        )
      })}
    </div>
  )
}
