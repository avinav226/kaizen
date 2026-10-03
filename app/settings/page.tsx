import Link from 'next/link';
import { InstallRow } from '@/components/InstallRow';
import { SignOutButton } from '@/components/SignOutButton';
import { debugEnabled } from '@/lib/debug';

export default function SettingsPage() {
  return (
    <main className="flex-1 pb-8">
      <Link href="/today" className="inline-flex min-h-11 items-center text-accent underline">
        Back to today
      </Link>
      <h1 className="mt-2 mb-6 font-display text-[28px] leading-[35px] font-medium">Settings</h1>

      <div className="flex flex-col gap-3">
        <InstallRow />
        {debugEnabled && (
          <Link href="/debug" className="flex min-h-14 items-center rounded-[16px] border border-border bg-surface px-5 font-medium">
            Debug menu
          </Link>
        )}
      </div>

      <div className="mt-10">
        <SignOutButton />
      </div>
    </main>
  );
}
