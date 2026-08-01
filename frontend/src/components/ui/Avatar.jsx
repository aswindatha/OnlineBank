export function Avatar({ name, color = '#4f46e5', size = 40 }) {
  const initials = name
    ?.trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  return (
    <div
      className="flex items-center justify-center rounded-full font-semibold text-white flex-shrink-0"
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </div>
  )
}
