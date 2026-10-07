import { useEffect, useState } from 'react'; import { Link } from 'react-router-dom'; import api, { errMsg } from '../services/api'; import { useApp } from '../context/AppContext'; import { money } from '../components/ProductCard';
const tabs = ['All', 'Placed', 'Shipped', 'Delivered', 'Cancelled']; const steps = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];
const col = { Delivered: '#16a34a', Shipped: '#4f46e5', Cancelled: '#dc2626', Placed: '#d97706', Confirmed: '#d97706', Packed: '#d97706' };
export default function Orders() {
  const { notify, refreshPoints } = useApp(); const [list, setList] = useState(null); const [tab, setTab] = useState('All'); const [open, setOpen] = useState(null); const [err, setErr] = useState('');
  const load = () => api.get('/orders').then((r) => setList(r.data)).catch((e) => setErr(errMsg(e))); useEffect(() => { load(); }, []);
  const cancel = async (id) => { if (!window.confirm('Cancel this order? Earned points will be reversed.')) return; try { await api.put(`/orders/${id}/cancel`); notify('Order cancelled'); load(); refreshPoints(); } catch (e) { notify(errMsg(e), 'err'); } };
  const shown = (list || []).filter((o) => tab === 'All' || o.status === tab);
  return (<div className="wrap sec"><h1>My Orders</h1><p className="muted">Track and manage your orders</p>
    <div className="tabs mt">{tabs.map((t) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t === 'All' ? 'All Orders' : t}</button>)}</div>
    {err && <div className="alert">{err}</div>}{!list && !err && <div className="sk" />}
    {list && !shown.length && <div className="empty"><h3>No orders here yet</h3><Link to="/products" className="btn">Start shopping</Link></div>}
    {shown.map((o) => <div key={o._id} className="card mt"><div className="row between"><div><b>Order #{o.orderNumber}</b><br /><small className="muted">Placed on {new Date(o.createdAt).toLocaleDateString('en-IN')}</small></div>
      <span className="st" style={{ color: col[o.status], background: col[o.status] + '1a' }}>{o.status}</span></div>
      <p className="mt">{o.items[0]?.name}{o.items.length > 1 && ` +${o.items.length - 1} more`}</p>
      <div className="row between"><b>{money(o.totalAmount)}</b><div className="row"><button className="btn ghost sm" onClick={() => setOpen(open === o._id ? null : o._id)}>{open === o._id ? 'Hide' : 'View Details'}</button>{['Placed', 'Confirmed', 'Packed'].includes(o.status) && <button className="btn ghost sm" onClick={() => cancel(o._id)}>Cancel</button>}</div></div>
      {open === o._id && <div className="mt"><div className="track">{steps.map((s, i) => { const done = o.status !== 'Cancelled' && i <= steps.indexOf(o.status); return <div key={s} className={done ? 'done' : ''}><i />{s}</div>; })}</div>
        <small className="muted">Subtotal {money(o.subtotal)} · Discount −{money(o.discount + o.pointsDiscount)} · Earned {o.pointsEarned} pts · Payment: {o.paymentStatus}</small></div>}</div>)}</div>);
}
