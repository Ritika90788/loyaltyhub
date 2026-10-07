import { useEffect, useState } from 'react'; import { Link } from 'react-router-dom'; import api from '../services/api'; import ProductCard from '../components/ProductCard'; import { storeImg } from '../utils/storeMeta'; import { useApp } from '../context/AppContext';
export default function Home() {
  const { user } = useApp(); const [stores, setStores] = useState([]); const [items, setItems] = useState(null); const [tab, setTab] = useState('');
  useEffect(() => { api.get('/stores').then((r) => setStores(r.data)).catch(() => {}); }, []);
  useEffect(() => { setItems(null); api.get('/products', { params: { sort: '-rating', limit: 4, store: tab || undefined } }).then((r) => setItems(r.data.items)).catch(() => setItems([])); }, [tab]);
  return (<>
    <section className="hero"><div className="wrap hero-in"><div>
      <span className="kicker">Shop More. Earn More. Get Rewarded.</span>
      <h1>One Wallet.<br />Every Store.<br />More Rewards.</h1>
      <p className="sub">Shop across your favorite stores, earn loyalty points and unlock rewards designed around you.</p>
      <div className="row mt"><Link to="/products" className="btn lg">Start Shopping</Link><Link to="/rewards" className="btn ghost lg">Explore Rewards</Link></div></div>
      <div className="art"><div className="stack">
        <Link to="/rewards" className="card wcard"><small>Your Loyalty Wallet</small><b>{(user?.loyaltyPoints ?? 0).toLocaleString('en-IN')} <span>Points</span></b><small>View your rewards</small></Link>
        <div className="card wcard"><b>Extra Rewards</b><small>on every order</small></div></div></div></div></section>
    <div className="wrap strip">{[['5+', 'Stores'], ['10K+', 'Products'], ['50K+', 'Happy Users'], ['4.8', 'User Rating'], ['100%', 'Secure Payments']].map(([a, b]) => <div key={b}><b>{a}</b><small>{b}</small></div>)}</div>
    <section className="wrap sec"><div className="sec-h"><h2>Shop from Our Stores</h2><Link to="/stores">View All Stores</Link></div>
      <div className="grid g5">{stores.map((s) => <Link key={s._id} to={`/products?store=${s._id}`} className="stile"><img src={storeImg(s.name)} alt={s.name} onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} /><div><b>{s.name}</b><small>{s.category}</small></div></Link>)}</div>
      {!stores.length && <p className="muted">Run the seed script to load stores.</p>}</section>
    <section className="wrap"><div className="wbanner"><div><h2>Join LoyaltyHub Rewards</h2><p className="muted">Shop, earn points, redeem rewards and get exclusive offers across every store.</p></div><Link to="/rewards" className="btn">Learn More</Link></div></section>
    <section className="wrap sec"><div className="sec-h"><h2>Featured Products</h2><Link to="/products">View All</Link></div>
      <div className="tabs"><button className={!tab ? 'on' : ''} onClick={() => setTab('')}>All</button>{stores.map((s) => <button key={s._id} className={tab === s._id ? 'on' : ''} onClick={() => setTab(s._id)}>{s.name}</button>)}</div>
      <div className="grid g4">{items === null ? Array.from({ length: 4 }, (_, i) => <div key={i} className="sk" />) : items.map((p) => <ProductCard key={p._id} p={p} />)}</div></section></>);
}
