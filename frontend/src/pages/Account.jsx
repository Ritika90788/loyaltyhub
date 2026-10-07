import { useEffect, useState } from 'react'; import { IconCheck } from '../components/Icons'; import { Link, useLocation, useNavigate } from 'react-router-dom'; import api, { errMsg } from '../services/api'; import { useApp } from '../context/AppContext'; import ProductCard, { money } from '../components/ProductCard';
export function OrderSuccess() {
  const o = useLocation().state?.order; if (!o) return <div className="wrap empty"><h2>No recent order</h2><Link className="btn" to="/orders">My orders</Link></div>;
  return (<div className="wrap empty"><span className="mono" style={{ width: 72, height: 72, fontSize: '2rem', background: '#dcfce7', color: '#16a34a' }}><IconCheck /></span><h1>Order placed successfully</h1><p className="muted">Order ID</p><h2>{o.orderNumber}</h2><h2>{money(o.totalAmount)}</h2><span className="earn">+{o.pointsEarned} points earned</span>
    <div className="row"><Link className="btn" to="/orders">Track Order</Link><Link className="btn ghost" to="/products">Continue Shopping</Link></div></div>);
}
export function Wishlist() {
  const [l, setL] = useState(null); useEffect(() => { api.get('/wishlist').then((r) => setL(r.data)).catch(() => setL([])); }, []);
  return (<div className="wrap sec"><h1>My Wishlist</h1>{!l ? <div className="sk mt" /> : !l.length ? <div className="empty"><h3>Save products you love and find them here later.</h3><Link className="btn" to="/products">Browse products</Link></div> : <div className="grid g4 mt">{l.map((p) => <ProductCard key={p._id} p={p} />)}</div>}</div>);
}
export function Coupons() {
  const { notify, user } = useApp(); const [l, setL] = useState(null); useEffect(() => { api.get('/coupons').then((r) => setL(r.data)).catch(() => setL([])); }, []);
  const link = (c) => `${location.origin}/claim/${c.code}`; const copy = (t, m) => { navigator.clipboard?.writeText(t); notify(m); };
  return (<div className="wrap sec"><h1>My Coupons</h1><p className="muted mt">Reward coupons you redeem can be sent to a friend with a share link. The first friend to claim it gets it.</p>{!l ? <div className="sk mt" /> : !l.length ? <div className="empty"><h3>No coupons available right now</h3></div> : <div className="grid g4 mt" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))' }}>{l.map((c) => { const days = Math.ceil((new Date(c.expiryDate) - Date.now()) / 864e5); const mine = c.owner === user.id; return (
    <div key={c._id} className="card" style={{ borderStyle: 'dashed', borderColor: 'var(--primary)' }}><div className="row between"><h2 style={{ color: 'var(--primary)' }}>{c.code}</h2>{mine && <span className="earn">Your reward</span>}</div><b>{c.discountType === 'percent' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}</b>
      <p className="muted">Min order {money(c.minimumOrder)}{c.maximumDiscount ? ` · Max discount ${money(c.maximumDiscount)}` : ''}</p><p className={days <= 3 ? 'bad' : 'muted'}>Expires in {days} day{days === 1 ? '' : 's'}</p>
      {mine ? <div className="row mt"><button className="btn sm" onClick={() => copy(link(c), 'Link copied. Send it to your friend.')}>Copy share link</button><a className="btn ghost sm" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`I'm gifting you a coupon on LoyaltyHub (${c.code}). Claim it here: ${link(c)}`)}`}>WhatsApp</a></div> : <button className="btn sm mt" onClick={() => copy(c.code, 'Code copied. Paste it in your cart.')}>Copy code</button>}</div>); })}</div>}</div>);
}
export function Referral() {
  const { user, notify } = useApp(); const code = user.name.toUpperCase().replace(/\W/g, '') + '250'; const link = `${location.origin}/login?ref=${code}`;
  return (<div className="wrap sec"><div className="rhero"><div><h1>Invite Friends. Earn Rewards.</h1><p>Invite a friend and both of you earn loyalty points after their first successful order.</p></div><div className="gift"></div></div>
    <div className="card mt"><small className="muted">Your referral code</small><h2>{code}</h2><div className="row"><input className="grow" readOnly value={link} /><button className="btn" onClick={() => { navigator.clipboard?.writeText(link); notify('Link copied'); }}>Copy</button></div>
      <div className="row mt">{[['Friends invited', 0], ['Successful referrals', 0], ['Points earned', 0]].map(([a, b]) => <div key={a} className="card grow"><b>{b}</b><br /><small className="muted">{a}</small></div>)}</div><small className="muted">Referral tracking and bonus points are coming soon.</small></div></div>);
}
export function Profile() {
  const { user, logout } = useApp(); const nav = useNavigate(); const [o, setO] = useState([]); useEffect(() => { api.get('/orders').then((r) => setO(r.data)).catch(() => {}); }, []);
  const next = { Bronze: 1000, Silver: 3000, Gold: 10000, Platinum: 10000 }[user.membershipLevel || 'Bronze'];
  return (<div className="wrap sec"><div className="row"><span className="avatar" style={{ width: 64, height: 64, fontSize: '1.6rem' }}>{user.name[0]}</span><div><h1>{user.name}</h1><span className="earn">{user.membershipLevel || 'Bronze'} Member</span></div></div>
    <div className="grid g4 mt">{[['Email', user.email], ['Loyalty points', user.loyaltyPoints ?? 0], ['Orders placed', o.length], ['Next level at', `${next} lifetime pts`]].map(([a, b]) => <div key={a} className="card"><small className="muted">{a}</small><h3>{b}</h3></div>)}</div>
    <div className="row mt"><Link className="btn ghost" to="/orders">My Orders</Link><Link className="btn ghost" to="/wishlist">Wishlist</Link><Link className="btn ghost" to="/coupons">Coupons</Link><Link className="btn ghost" to="/referral">Refer & Earn</Link><button className="btn" onClick={() => { logout(); nav('/'); }}>Logout</button></div></div>);
}
