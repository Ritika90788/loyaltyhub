import { createContext, useContext, useState, useEffect, useCallback } from 'react'; import api from '../services/api';
const Ctx = createContext(); export const useApp = () => useContext(Ctx);
export function AppProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('lh_user') || 'null'));
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('lh_cart') || '[]'));
  const [toast, setToast] = useState(null);
  useEffect(() => localStorage.setItem('lh_cart', JSON.stringify(cart)), [cart]);
  const notify = useCallback((msg, type = 'ok') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2800); }, []);
  const login = (token, u) => { localStorage.setItem('lh_token', token); localStorage.setItem('lh_user', JSON.stringify(u)); setUser(u); };
  const logout = () => { localStorage.removeItem('lh_token'); localStorage.removeItem('lh_user'); setUser(null); setCart([]); localStorage.removeItem('lh_cart'); };
  const refreshPoints = async () => { try { const { data } = await api.get('/points'); setUser((u) => { const n = { ...u, loyaltyPoints: data.points, membershipLevel: data.level, lifetime: data.lifetime }; localStorage.setItem('lh_user', JSON.stringify(n)); return n; }); } catch (e) { if (e.response?.status === 401) logout(); } };
  useEffect(() => { if (user) refreshPoints(); }, [user?.id]);
  const addToCart = (p, qty = 1) => { if (!user) return notify('Please sign in to add items to your cart', 'err'); setCart((c) => c.some((i) => i._id === p._id && i.variant === p.variant) ? c.map((i) => i._id === p._id && i.variant === p.variant ? { ...i, qty: Math.min(i.qty + qty, p.stock || 99) } : i) : [...c, { ...p, qty }]); notify('Added to cart'); };
  const same = (a, b) => a._id === b._id && a.variant === b.variant;
  const setQty = (it, qty) => setCart((c) => c.map((i) => same(i, it) ? { ...i, qty: Math.max(1, qty) } : i));
  const removeItem = (it) => setCart((c) => c.filter((i) => !same(i, it)));
  return <Ctx.Provider value={{ user, login, logout, refreshPoints, cart, setCart, addToCart, setQty, removeItem, toast, notify }}>{children}</Ctx.Provider>;
}
