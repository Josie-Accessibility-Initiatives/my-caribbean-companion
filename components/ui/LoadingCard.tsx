/** Centered card shown while a page loads its data. */
export function LoadingCard({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="section">
      <div className="planner-card loading-card">
        <p>{message}</p>
      </div>
    </div>
  );
}
