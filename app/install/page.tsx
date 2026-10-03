import { InstallScreen } from '@/components/InstallScreen';

export default async function InstallPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  return <InstallScreen fromSettings={from === 'settings'} />;
}
