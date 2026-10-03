import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DebugPanel } from '@/components/DebugPanel';
import { loadToday } from '@/lib/data';
import { debugEnabled } from '@/lib/debug';

export default async function DebugPage() {
  if (!debugEnabled) notFound();
  const data = await loadToday();
  return (
    <main className="flex-1 pb-8">
      <Link href="/today" className="text-accent underline">
        Back to today
      </Link>
      <h1 className="mt-4 mb-2 font-display text-[28px] leading-[35px] font-medium">Debug menu</h1>
      <p className="mb-8 text-text-secondary">For testing only. It never appears in a public build.</p>
      <DebugPanel goalId={data.goal.id} timezone={data.timezone} />
    </main>
  );
}
