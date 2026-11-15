import type { ReactNode } from 'react';

interface TagProps {
  color?: 'gray' | 'low' | 'medium' | 'high';
  children: ReactNode;
}

export default function Tag({ color = 'gray', children }: TagProps) {
  return <span className={`tag tag-${color}`}>{children}</span>;
}
