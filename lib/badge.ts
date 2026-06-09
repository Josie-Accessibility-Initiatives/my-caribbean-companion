export type Complexity = 'easy' | 'moderate' | 'hard'

export const COMPLEXITY_ORDER: Record<Complexity, number> = {
  easy: 0,
  moderate: 1,
  hard: 2,
}

export function complexityColor(c: Complexity): string {
  return c === 'easy' ? '#166534' : c === 'moderate' ? '#92400e' : '#991b1b'
}

export function complexityBg(c: Complexity): string {
  return c === 'easy' ? '#dcfce7' : c === 'moderate' ? '#fef3c7' : '#fee2e2'
}
