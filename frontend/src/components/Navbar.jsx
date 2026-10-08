import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IconHeart, IconBell, IconCart, IconMenu, IconSearch } from './Icons';

const LINKS = [
  ['/', 'Home'],
  ['/stores', 'Stores'],
  ['/products', 'Products'],
  ['/rewards', 'Rewards'],
  ['/assistant', 'AI Assistant'],
  ['/orders', 'Orders']
];

export default function Navbar() {
  const { user, cart } = useApp();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const nav = useNavigate();

  const count = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <header className="nav">
      <div className="wrap nav-in">

        <Link to="/" className="logo">LOYALTYHUB</Link>

        <nav
          className={`links ${open ? 'open' : ''}`}
          onClick={() => setOpen(false)}
        >
          {LINKS.map(([to, l]) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {l}
            </NavLink>
          ))}
        </nav>

        <label className="search">
          <IconSearch />
          <input
            placeholder="Search for products, brands and more"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' &&
              nav(`/products?q=${encodeURIComponent(q)}`)
            }
          />
        </label>

        <div className="nav-r">

          {user && (
            <Link to="/rewards" className="pts">
              {user.loyaltyPoints ?? 0} pts
            </Link>
          )}

          <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
            <IconHeart />
          </Link>

          <Link to="/notifications" className="icon-btn" aria-label="Notifications">
            <IconBell />
          </Link>

          <Link to="/cart" className="icon-btn" aria-label="Cart">
            <IconCart />
            {count > 0 && <span className="badge">{count}</span>}
          </Link>

          {user ? (
            <>
              <span className="hi">
                Hi, {user.name?.split(' ')[0] || 'User'}
              </span>

              {user.role === 'admin' && (
                <Link to="/admin" className="btn ghost sm">
                  Admin
                </Link>
              )}

              <Link
                to="/profile"
                className="avatar"
                title="Profile"
              >
                {user.name?.[0] || 'U'}
              </Link>
            </>
          ) : (
            <Link to="/login" className="btn sm">
              Sign in
            </Link>
          )}

          <button
            className="icon-btn burger"
            aria-label="Menu"
            onClick={() => setOpen(!open)}
          >
            <IconMenu />
          </button>

        </div>
      </div>
    </header>
  );
}