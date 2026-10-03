/** Shown instantly while the check-in loads, so a tap on Today answers back right away. */
export default function Loading() {
  return (
    <main className="flex flex-1 flex-col gap-6" aria-busy="true" aria-label="Loading">
      <div className="h-6 w-40 rounded-full bg-surface-sunken" />
      <div className="h-20 w-full rounded-[16px] bg-surface-sunken" />
      <div className="h-24 w-full rounded-[16px] bg-surface-sunken" />
    </main>
  );
}
