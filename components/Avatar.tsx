interface AvatarProps {
  nickname: string
  color: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Avatar({
  nickname,
  color,
  size = 'md',
}: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-lg',
  }

  return (
    <div
      className={`avatar flex-shrink-0 ${sizeClasses[size]} font-bold`}
      style={{ background: color }}
    >
      {(nickname || 'G')[0]}
    </div>
  )
}
