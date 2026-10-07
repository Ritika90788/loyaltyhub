import { useState } from 'react'; import { useLocation, useNavigate, Navigate } from 'react-router-dom'; import api, { errMsg } from '../services/api'; import { useApp } from '../context/AppContext'; import { money } from '../components/ProductCard';
export default function Checkout() {
  const { cart, user, setCart, notify, refreshPoints } = useApp(); const nav = useNavigate(); const { state } = useLocation(); const cp = state?.cp, usePts = state?.usePts;
  const [a, setA] = useState({ name: user.name, phone: '', line1: '', city: '', pincode: '' }); const [pay, setPay] = useState('COD'); const [busy, setBusy] = useState(false);
  if (!cart.length) return <Navigate to="/cart" replace />;
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0); const after = sub - (cp?.discount || 0); const pd = usePts ? Math.min(Math.floor((user.loyaltyPoints || 0) / 10), after) : 0; const del = after >= 499 ? 0 : 49; const total = after - pd + del;
  const on = (k) => (e) => setA({ ...a, [k]: e.target.value });
  const place = async () => { if (!a.name || !a.phone || !a.line1 || !a.city || !a.pincode) return notify('Please fill the delivery address', 'err'); setBusy(true);
    try { const { data } = await api.post('/orders', { items: cart.map((i) => ({ productId: i._id, qty: i.qty })), couponCode: cp?.code, pointsToUse: pd * 10, address: a, paymentMethod: pay }); setCart([]); refreshPoints(); nav('/order-success', { state: { order: data }, replace: true }); }
    catch (e) { notify(errMsg(e), 'err'); } finally { setBusy(false); } };
  return (<div className="wrap sec"><h1>Checkout</h1><div className="cart mt"><div className="grid">
    <div className="card"><h3>1. Delivery Address</h3><div className="grid mt" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>{[['name', 'Full name'], ['phone', 'Phone'], ['line1', 'Address'], ['city', 'City'], ['pincode', 'Pincode']].map(([k, l]) => <input key={k} placeholder={l} value={a[k]} onChange={on(k)} />)}</div></div>
    <div className="card"><h3>2. Payment Method</h3>{[['COD', 'Cash on Delivery'], ['UPI', 'UPI'], ['CARD', 'Card'], ['DEMO', 'Demo Payment']].map(([v, l]) => <label key={v} className="check mt"><input type="radio" checked={pay === v} onChange={() => setPay(v)} />{l}</label>)}<small className="muted">Payments are simulated. Structured for a real gateway later.</small></div>
    <div className="card"><h3>3. Order Items</h3>{cart.map((i) => <div key={i._id + (i.variant || '')} className="row between mt"><span>{i.name} × {i.qty}</span><b>{money(i.price * i.qty)}</b></div>)}</div></div>
    <aside className="card sum"><h3>Order Summary</h3><div className="row between"><span>Subtotal</span><span>{money(sub)}</span></div>{cp && <div className="row between ok"><span>Coupon {cp.code}</span><span>−{money(cp.discount)}</span></div>}{pd > 0 && <div className="row between ok"><span>Points</span><span>−{money(pd)}</span></div>}
      <div className="row between"><span>Delivery</span><span>{del ? money(del) : 'Free'}</span></div><hr /><div className="row between"><b>Total</b><b>{money(total)}</b></div><button className="btn full lg" disabled={busy} onClick={place}>{busy ? 'Placing…' : 'Place Order'}</button></aside></div></div>);
}
