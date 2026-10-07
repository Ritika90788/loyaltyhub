import { productImage } from '../utils/productImage';
import { useState } from 'react'; import { Link, useNavigate } from 'react-router-dom'; import api, { errMsg } from '../services/api'; import { useApp } from '../context/AppContext'; import { money } from '../components/ProductCard';
export default function Cart() {
  const { cart, setQty, removeItem, setCart, user, notify, refreshPoints } = useApp(); const nav = useNavigate();
  const [code, setCode] = useState(''); const [cp, setCp] = useState(null); const [usePts, setUsePts] = useState(false); const [busy, setBusy] = useState(false);
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0); const items = cart.map((i) => ({ productId: i._id, qty: i.qty }));
  const afterCoupon = sub - (cp?.discount || 0); const ptsDisc = usePts ? Math.min(Math.floor((user.loyaltyPoints || 0) / 10), afterCoupon) : 0;
  const delivery = afterCoupon >= 499 || !cart.length ? 0 : 49; const total = afterCoupon - ptsDisc + delivery;
  const apply = async () => { try { setCp((await api.post('/coupons/validate', { code, items })).data); notify('Coupon applied'); } catch (e) { setCp(null); notify(errMsg(e), 'err'); } };
  const place = async () => { setBusy(true); try {
    const { data } = await api.post('/orders', { items, couponCode: cp?.code, pointsToUse: ptsDisc * 10, paymentMethod: 'DEMO', address: { line1: 'Demo address', city: 'Vadodara', pincode: '390001' } });
    setCart([]); await refreshPoints(); notify(`Order ${data.orderNumber} placed! +${data.pointsEarned} points`); nav('/wallet'); } catch (e) { notify(errMsg(e), 'err'); } finally { setBusy(false); } };
  if (!cart.length) return <div className="wrap empty"><h2>Your cart is waiting for something amazing.</h2><Link to="/products" className="btn">Browse products</Link></div>;
  return (<div className="wrap sec cart"><div><h1>Your Cart</h1>{cart.map((i) => <div key={i._id + (i.variant || '')} className="card line"><img src={productImage(i)} alt="" /><div className="grow"><h3>{i.name}</h3><b>{money(i.price)}</b>{i.variant && <small className="muted"> · {i.variant}</small>}</div>
    <div className="qty"><button onClick={() => setQty(i, i.qty - 1)}>−</button><span>{i.qty}</span><button onClick={() => setQty(i, i.qty + 1)}>+</button></div><button className="link" onClick={() => removeItem(i)}>Remove</button></div>)}</div>
    <aside className="card sum"><h3>Order Summary</h3>
      <div className="row between"><span>Subtotal</span><span>{money(sub)}</span></div>
      {cp && <div className="row between ok"><span>Coupon ({cp.code})</span><span>−{money(cp.discount)}</span></div>}
      {ptsDisc > 0 && <div className="row between ok"><span>Points discount</span><span>−{money(ptsDisc)}</span></div>}
      <div className="row between"><span>Delivery</span><span>{delivery ? money(delivery) : 'Free'}</span></div><hr/>
      <div className="row between"><b>Total</b><b>{money(total)}</b></div>
      <div className="row"><input placeholder="Enter coupon code" value={code} onChange={(e) => setCode(e.target.value)} /><button className="btn ghost" onClick={apply}>Apply</button></div>
      <label className="check"><input type="checkbox" checked={usePts} onChange={(e) => setUsePts(e.target.checked)} /> Use loyalty points <small className="muted">({user.loyaltyPoints || 0} available)</small></label>
      <button className="btn full lg" onClick={() => nav('/checkout', { state: { cp, usePts } })}>Proceed to Checkout</button><small className="muted">Final amounts are recalculated securely on the server.</small></aside></div>);
}
