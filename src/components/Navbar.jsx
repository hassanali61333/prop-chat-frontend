import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadTotal } = useSocket();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'text-brand' : 'text-ink hover:bg-surface'
    }`;

  const links = (
    <>
      <NavLink to="/" end className={linkClass} onClick={() => setOpen(false)}>
        Browse
      </NavLink>
      {isAuthenticated && user.role === 'agent' && (
        <NavLink to="/dashboard" className={linkClass} onClick={() => setOpen(false)}>
          My Listings
        </NavLink>
      )}
      {isAuthenticated && (
        <NavLink to="/chat" className={linkClass} onClick={() => setOpen(false)}>
          <span className="inline-flex items-center gap-2">
            Messages
            {unreadTotal > 0 && (
              <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-semibold leading-5 text-white">
                {unreadTotal > 99 ? '99+' : unreadTotal}
              </span>
            )}
          </span>
        </NavLink>
      )}
    </>
  );

  return (
    <header className="z-30 border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white">P</span>
          PropChat
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-1 md:flex">{links}</nav>
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <div className="text-right leading-tight">
                <p className="text-sm font-semibold text-ink">{user.name}</p>
                <p className="text-xs capitalize text-neutral-500">{user.role}</p>
              </div>
              <button onClick={handleLogout} className="btn-secondary !py-2">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !py-2">
                Log in
              </Link>
              <Link to="/signup" className="btn-primary !py-2">
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="relative rounded-xl p-2 text-ink hover:bg-surface md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
          {!open && unreadTotal > 0 && (
            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-brand" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-line bg-white px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">{links}</nav>
          <div className="mt-3 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <p className="px-3 text-sm text-neutral-500">
                  Signed in as <span className="font-semibold text-ink">{user.name}</span> ({user.role})
                </p>
                <button onClick={handleLogout} className="btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary" onClick={() => setOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
