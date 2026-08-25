export default function Loading() {
  return (
    <main className="min-h-screen bg-[#F3FBEE] flex flex-col items-center justify-center gap-4" aria-live="polite">
      <div className="page-spinner" aria-label="Loading" />
      <p className="text-base font-semibold text-[#676662]">Preparing your storefront…</p>
    </main>
  );
}
