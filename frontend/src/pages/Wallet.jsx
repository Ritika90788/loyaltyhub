import { useEffect, useState } from 'react'; import api, { errMsg } from '../services/api'; import { useApp } from '../context/AppContext';
const types = ['ALL', 'EARN', 'REDEEM', 'EXPIRED', 'REVERSAL'];
export default function Wallet() {
  const { user, refreshPoints } = useApp(); const [type, setType] = useState('ALL'); const [tx, setTx] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { refreshPoints(); }, []);
  useEffect(() => { setTx(null); api.get('/points/transactions', { params: type === 'ALL' ? {} : { type } }).then((r) => setTx(r.data)).catch((e) => setErr(errMsg(e))); }, [type]);
  const pts = user.loyaltyPoints || 0;
  return (<div className="wrap sec"><div className="wallet-hero"><small>AVAILABLE POINTS</small><h1>{pts.toLocaleString('en-IN')}</h1><p>Reward value ₹{(pts / 10).toLocaleString('en-IN')} · {user.membershipLevel || 'Bronze'} member</p></div>
    <h2>Points History</h2><div className="row">{types.map((t) => <button key={t} className={`btn sm ${t === type ? '' : 'ghost'}`} onClick={() => setType(t)}>{t[0] + t.slice(1).toLowerCase()}</button>)}</div>
    {err && <div className="alert">{err}</div>}
    <div className="card">{tx === null && !err && <div className="sk" style={{ height: 120 }} />}{tx?.length === 0 && <p className="empty">No transactions yet. Place an order to start earning.</p>}
      {tx?.map((t) => { const plus = t.type === 'EARN' || t.type === 'BONUS'; return <div key={t._id} className="tx"><div><b>{t.reason}</b><br /><small className="muted">{new Date(t.createdAt).toLocaleDateString('en-IN')} · {t.type}</small></div><b className={plus ? 'ok' : 'bad'}>{plus ? '+' : '−'}{t.points}</b></div>; })}</div>
    <div className="card how"><h3>How Loyalty Points Work</h3><p className="muted">Earn 10 points per ₹100 spent. Silver, Gold and Platinum members earn 5%, 10% and 20% bonus points. 10 points = ₹1 off at checkout. Cancelled orders reverse earned points.</p></div></div>);
}
