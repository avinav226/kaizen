export default function Loading() {
  return (
    <main className="flex flex-1 flex-col gap-4" aria-busy="true" aria-label="Loading">
      <div className="h-6 w-56 rounded-full bg-surface-sunken" />
      <div className="h-52 w-full rounded-[18px] bg-surface-sunken" />
      <div className="h-20 w-full rounded-[18px] bg-surface-sunken" />
    </main>
  );
}
