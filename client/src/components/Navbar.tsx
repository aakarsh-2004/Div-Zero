import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b border-white/20 bg-black">
      <nav className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="font-mono text-base font-bold tracking-tight text-white hover:text-white/70 transition-colors"
        >
          DIV<span className="text-white/40">/</span>ZERO
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm font-mono">
          {user ? (
            <>
              <NavLink
                to="/problems"
                className={({ isActive }) =>
                  isActive
                    ? 'text-white border-b border-white pb-0.5'
                    : 'text-white/50 hover:text-white transition-colors'
                }
              >
                problems
              </NavLink>

              {user.isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    isActive
                      ? 'text-white border-b border-white pb-0.5'
                      : 'text-white/50 hover:text-white transition-colors'
                  }
                >
                  admin
                </NavLink>
              )}

              <span className="text-white/30">|</span>

              <span className="text-white/40">{user.username}</span>

              <button
                onClick={handleLogout}
                className="text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive
                    ? 'text-white border-b border-white pb-0.5'
                    : 'text-white/50 hover:text-white transition-colors'
                }
              >
                login
              </NavLink>
              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  isActive
                    ? 'text-white border-b border-white pb-0.5'
                    : 'text-white/50 hover:text-white transition-colors'
                }
              >
                signup
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
