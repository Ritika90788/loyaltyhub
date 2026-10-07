import { SIZES } from '../utils/variants';
import { useEffect, useState } from 'react'; import { Stars } from '../components/Icons'; import { Link, useParams, useNavigate } from 'react-router-dom'; import api, { errMsg } from '../services/api'; import { useApp } from '../context/AppContext';
export function Notifications() {
  const [l, setL] = useState(null);
  useEffect(() => { api.get('/notifications').then((r) => { setL(r.data); api.put('/notifications/read'); }).catch(() => setL([])); }, []);
  return (<div className="wrap sec"><h1>Notifications</h1>{!l ? <div className="sk mt" /> : !l.length ? <div className="empty"><h3>You're all caught up.</h3></div> : <div className="card mt">{l.map((n) => <div key={n._id} className="tx"><span style={{ fontWeight: n.read ? 400 : 700 }}>{n.text}</span><small className="muted">{new Date(n.createdAt).toLocaleDateString('en-IN')}</small></div>)}</div>}</div>);
}
export function Referral() {
  const { notify } = useApp(); const [d, setD] = useState(null); useEffect(() => { api.get('/referrals').then((r) => setD(r.data)).catch((e) => notify(errMsg(e), 'err')); }, []);
  if (!d) return <div className="wrap sec"><div className="sk" /></div>; const link = `${location.origin}/login?ref=${d.code}`;
  return (<div className="wrap sec"><div className="rhero"><div><h1>Invite Friends. Earn Rewards.</h1><p>Your friend gets 1,200 welcome points when they sign up with your link (1,000 without it), and you earn 100 points after their first successful order.</p></div><div className="gift"></div></div>
    <div className="card mt"><small className="muted">Your referral code</small><h2>{d.code}</h2><div className="row"><input className="grow" readOnly value={link} /><button className="btn" onClick={() => { navigator.clipboard?.writeText(link); notify('Link copied'); }}>Copy</button></div>
      <div className="row mt">{[['Friends invited', d.invited], ['Successful referrals', d.successful], ['Points earned', d.points]].map(([a, b]) => <div key={a} className="card grow"><h2>{b}</h2><small className="muted">{a}</small></div>)}</div></div></div>);
}
export function Variants({ p, onPick }) {
  const [s, setS] = useState(''); const sz = SIZES[p.category];
  useEffect(() => { onPick(s ? `Size ${s}` : ''); }, [s]);
  if (!sz) return null;
  return (<div className="row mt"><span className="muted">Select size</span>{sz.map((x) => <button key={x} className={`chip ${s === x ? 'sel' : ''}`} onClick={() => setS(x)}>{x}</button>)}</div>);
}
export function Reviews({ id }) {
  const { user, notify } = useApp(); const [l, setL] = useState([]); const [rt, setRt] = useState(5); const [cm, setCm] = useState('');
  const load = () => api.get(`/products/${id}/reviews`).then((r) => setL(r.data)).catch(() => {}); useEffect(() => { load(); }, [id]);
  const submit = async () => { try { await api.post(`/products/${id}/reviews`, { rating: rt, comment: cm }); setCm(''); notify('Thanks for your review!'); load(); } catch (e) { notify(errMsg(e), 'err'); } };
  return (<div className="mt"><h2>Customer Reviews</h2>
    {user ? <div className="card mt row"><select value={rt} onChange={(e) => setRt(+e.target.value)}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}</select><input className="grow" placeholder="Share your experience" value={cm} onChange={(e) => setCm(e.target.value)} /><button className="btn" onClick={submit}>Submit</button></div> : <p className="muted mt"><Link to="/login">Sign in</Link> to write a review.</p>}
    {l.map((r) => <div key={r._id} className="card mt"><b>{r.name}</b> <span className="stars"><Stars n={r.rating} /></span><p className="muted">{r.comment}</p></div>)}{!l.length && <p className="muted mt">No reviews yet. Be the first!</p>}</div>);
}
export function Claim() {
  const { code } = useParams(); const nav = useNavigate(); const { notify } = useApp(); const [c, setC] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api.get(`/coupons/claim/${code}`).then((r) => setC(r.data)).catch((e) => setErr(errMsg(e))); }, [code]);
  const claim = async () => { try { const { data } = await api.post(`/coupons/claim/${code}`); notify(data.message); nav('/coupons'); } catch (e) { notify(errMsg(e), 'err'); } };
  if (err) return <div className="wrap empty"><h2>{err}</h2><Link className="btn" to="/">Back to home</Link></div>; if (!c) return <div className="wrap sec"><div className="sk" /></div>;
  return (<div className="wrap auth"><div className="card" style={{ maxWidth: 420, width: '100%', textAlign: 'center', display: 'grid', gap: 10, padding: 30 }}><small className="muted">A coupon was shared with you</small><h1 style={{ color: 'var(--primary)' }}>{c.code}</h1>
    <b>{c.discountType === 'percent' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}</b><p className="muted">Minimum order ₹{c.minimumOrder}{c.maximumDiscount ? ` · Max discount ₹${c.maximumDiscount}` : ''}</p><button className="btn full lg" onClick={claim}>{c.mine ? 'Already in your account' : 'Add to my account'}</button></div></div>);
}
