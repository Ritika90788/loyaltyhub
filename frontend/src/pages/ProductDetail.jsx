import { SIZES } from '../utils/variants';
import { productImage } from '../utils/productImage';
import { useEffect, useState } from 'react'; import { Stars } from '../components/Icons'; import { Variants, Reviews } from './More'; import { useParams, useNavigate } from 'react-router-dom'; import api, { errMsg } from '../services/api'; import { useApp } from '../context/AppContext'; import ProductCard, { money } from '../components/ProductCard';
export default function ProductDetail() {
  const { id } = useParams(); const nav = useNavigate(); const { addToCart, notify } = useApp(); const [p, setP] = useState(null); const [sim, setSim] = useState([]); const [qty, setQty] = useState(1); const [v, setV] = useState(''); const [err, setErr] = useState('');
  useEffect(() => { setP(null); setQty(1); api.get(`/products/${id}`).then((r) => { setP(r.data); api.get('/products', { params: { category: r.data.category, limit: 5 } }).then((x) => setSim(x.data.items.filter((i) => i._id !== id).slice(0, 4))); }).catch((e) => setErr(errMsg(e))); }, [id]);
  if (err) return <div className="wrap empty"><h2>{err}</h2></div>; if (!p) return <div className="wrap sec"><div className="sk" /></div>;
  const add = () => { if (SIZES[p.category] && !v) { notify('Please select a size first', 'err'); return false; } addToCart({ ...p, variant: v }, qty); return true; };
  const off = p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
  return (<div className="wrap sec"><div className="pd">
    <div className="gallery"><div className="thumbs"><img src={productImage(p)} alt="" /></div><div className="big"><img src={productImage(p)} alt={p.name} /></div></div>
    <div><small className="muted">{p.brand}</small><h1>{p.name}</h1><div className="stars"><Stars n={Math.round(p.rating)} /> <span className="muted">{p.rating} ({p.reviewsCount} reviews)</span></div>
      <div className="price mt"><b>{money(p.price)}</b>{off > 0 && <><s>{money(p.originalPrice)}</s><span className="off">{off}% OFF</span></>}</div>
      <p className={p.stock > 0 ? 'ok mt' : 'bad mt'}>{p.stock > 0 ? (p.stock < 10 ? `Only ${p.stock} left` : 'In stock') : 'Out of stock'}</p>
      <Variants p={p} onPick={setV} /><div className="row mt"><span className="muted">Quantity</span><div className="qty"><button onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span>{qty}</span><button onClick={() => setQty(Math.min(p.stock, qty + 1))}>+</button></div></div>
      <div className="row mt"><button className="btn ghost lg" disabled={p.stock < 1} onClick={add}>Add to Cart</button><button className="btn lg" disabled={p.stock < 1} onClick={() => add() && nav('/cart')}>Buy Now</button></div>
      <div className="checks"><span className="ok">Free delivery on orders above ₹499</span><span className="ok">Easy 7-day return</span><span className="earn"> Earn {Math.floor((p.price * qty) / 10)} Loyalty Points</span></div>
      <h3 className="mt">Description</h3><p className="muted">{p.description}</p></div></div>
    <Reviews id={p._id} />{sim.length > 0 && <><div className="sec-h mt"><h2>Similar Products</h2></div><div className="grid g4">{sim.map((x) => <ProductCard key={x._id} p={x} />)}</div></>}</div>);
}
