import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Camera, Sparkles, User } from 'lucide-react';
import './BottomNav.css';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/wardrobe', icon: ShoppingBag, label: 'Wardrobe' },
  { path: '/camera', icon: Camera, label: 'Add', isCenter: true },
  { path: '/stylist', icon: Sparkles, label: 'AI Stylist' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();
  const [ripple, setRipple] = useState(null);

  useEffect(() => {
    if (ripple !== null) {
      const timer = setTimeout(() => setRipple(null), 500);
      return () => clearTimeout(timer);
    }
  }, [ripple]);

  // Hide nav on onboarding
  if (location.pathname === '/onboarding') return null;

  return (
    <nav className="bottom-nav glass-strong" id="bottom-navigation">
      {navItems.map((item, idx) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`nav-item ${item.isCenter ? 'nav-item--center' : ''} ${isActive ? 'nav-item--active' : ''}`}
            onClick={() => setRipple(idx)}
            id={`nav-${item.label.toLowerCase()}`}
          >
            {item.isCenter ? (
              <div className="nav-center-btn">
                <Icon size={26} strokeWidth={2.5} />
                {ripple === idx && <span className="nav-ripple" />}
              </div>
            ) : (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="nav-label">{item.label}</span>
                {isActive && <span className="nav-dot" />}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
