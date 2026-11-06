import type { ReactNode } from 'react';

interface AppRoutesProps {
  activePage: string;
  pages: Record<string, () => ReactNode>;
  fallback: ReactNode;
}

export default function AppRoutes({
  activePage,
  pages,
  fallback,
}: AppRoutesProps) {
  return <>{pages[activePage]?.() ?? fallback}</>;
}
