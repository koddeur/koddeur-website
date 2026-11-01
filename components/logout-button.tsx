// Admin logout as a round icon button, styled like the theme toggle next to it.
export function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button type="submit" className="theme-toggle" aria-label="Se déconnecter" title="Se déconnecter">
        {/* Door with an arrow leaving it. */}
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
      </button>
    </form>
  );
}
