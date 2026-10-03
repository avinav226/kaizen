import { createClient } from '@/lib/supabase/server';

export default async function TodayPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <main>
      <h1 className="font-display text-[28px] leading-[35px]">Today</h1>
      <p className="mt-3 text-text-secondary">Signed in as {data.user?.email}.</p>
      <form action="/auth/signout" method="post" className="mt-8">
        <button
          type="submit"
          className="h-11 rounded-[12px] border border-border-strong bg-surface px-4 font-medium"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
