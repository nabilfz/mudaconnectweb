import { useLocation } from 'react-router';
import { Seo } from './Seo';

const ADMIN_TITLES: Array<[pattern: RegExp, title: string]> = [
  [/^\/admin\/programs\/new$/, 'Tambah program'],
  [/^\/admin\/programs\/[^/]+\/edit$/, 'Edit program'],
  [/^\/admin\/programs$/, 'Kelola program'],
  [/^\/admin\/faqs$/, 'Kelola FAQ'],
  [/^\/admin\/contents$/, 'Kelola konten'],
  [/^\/admin\/submissions$/, 'Formulir minat'],
  [/^\/admin\/messages$/, 'Pesan masuk'],
  [/^\/admin\/chatbot$/, 'Pengaturan MudaBot'],
  [/^\/admin\/settings$/, 'Pengaturan situs'],
  [/^\/admin$/, 'Dashboard admin'],
];

export interface AdminSeoProps {
  title?: string;
}

export function AdminSeo({ title }: AdminSeoProps) {
  const { pathname } = useLocation();
  const routeTitle =
    title ??
    ADMIN_TITLES.find(([pattern]) => pattern.test(pathname))?.[1] ??
    'Portal pengelola';

  return (
    <Seo
      title={routeTitle}
      description="Portal pengelola internal MudaConnect."
      path={pathname}
      noIndex
    />
  );
}
