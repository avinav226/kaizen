import { PrimaryButton } from './PrimaryButton';

export function InstallCard({ onInstall, busy }: { onInstall: () => void; busy: boolean }) {
  return (
    <>
      <h1 className="mt-8 font-display text-[28px] leading-[35px] font-medium">Install Kaizen</h1>
      <p className="mt-3 text-text-secondary">It opens like an app, can nudge you each day, and keeps working without a connection.</p>
      <div className="mt-8">
        <PrimaryButton onClick={onInstall} disabled={busy}>
          {busy ? 'Installing…' : 'Install'}
        </PrimaryButton>
      </div>
    </>
  );
}
