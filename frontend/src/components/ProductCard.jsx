import { SIZES } from '../utils/variants';
import { IconHeart, Stars } from './Icons'; import { productImage } from '../utils/productImage';
import api, { errMsg } from '../services/api'; import { Link } from 'react-router-dom'; import { useApp } from '../context/AppContext';
export const money = (n) => '₹' + Number(n).toLocaleString('en-IN');
export default function ProductCard({ p }) {
  const { addToCart, notify, user } = useApp(); const wish = async () => { if (!user) return notify('Sign in to save products', 'err'); try { await api.post(`/wishlist/${p._id}`); notify('Wishlist updated'); } catch (e) { notify(errMsg(e), 'err'); } };
  const off = p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
  return (<article className="card pc">
    <Link to={`/products/${p._id}`} className="pc-img"><img src={productImage(p)} alt={p.name} loading="lazy" />{off > 0 && <span className="tag">{off}% OFF</span>}</Link><button className="heart" onClick={wish} aria-label="Wishlist"><IconHeart /></button>
    <div className="pc-b"><h3>{p.name}</h3><small className="muted">{p.brand}</small>
      <div className="stars"><Stars n={Math.round(p.rating)} /><span className="muted"> {p.rating?.toFixed(1)} ({p.reviewsCount})</span></div>
      <div className="price"><b>{money(p.price)}</b>{off > 0 && <s>{money(p.originalPrice)}</s>}{off > 0 && <span className="off">{off}% off</span>}</div>
      <div className="pc-f"><span className="earn">+{Math.floor(p.price / 10)} pts</span>{SIZES[p.category] && p.stock > 0 ? <Link to={`/products/${p._id}`} className="btn sm">Select size</Link> : <button className="btn sm" disabled={p.stock < 1} onClick={() => addToCart(p)}>{p.stock < 1 ? 'Sold out' : 'Add'}</button>}</div></div></article>);
}
