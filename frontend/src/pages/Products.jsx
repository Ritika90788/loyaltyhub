import { useEffect, useState } from 'react'; import { useSearchParams } from 'react-router-dom'; import api, { errMsg } from '../services/api'; import ProductCard from '../components/ProductCard';
const cats = ['Men', 'Women', 'Shoes', 'Accessories', 'Skincare', 'Makeup', 'Audio', 'Wearables', 'Decor', 'Bedding', 'Kitchen', 'Lifestyle', 'Bags'];
export default function Products() {
  const [sp, setSp] = useSearchParams(); const [data, setData] = useState(null); const [err, setErr] = useState(''); const [stores, setStores] = useState([]); const [fo, setFo] = useState(false);
  const g = (k) => sp.get(k) || ''; const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); if (k !== 'page') n.delete('page'); setSp(n); };
  useEffect(() => { api.get('/stores').then((r) => setStores(r.data)).catch(() => {}); }, []);
  useEffect(() => { setData(null); setErr(''); const params = Object.fromEntries(sp); params.limit = 9; api.get('/products', { params }).then((r) => setData(r.data)).catch((e) => setErr(errMsg(e))); }, [sp.toString()]);
  const page = +g('page') || 1;
  return (<div className="wrap sec"><div className="plist">
    <aside className={`card side ${fo ? 'open' : ''}`}><h4>Category</h4>{cats.map((c) => <label key={c}><input type="radio" name="c" checked={g('category') === c} onChange={() => set('category', c)} />{c}</label>)}
      <h4>Store</h4>{stores.map((s) => <label key={s._id}><input type="radio" name="s" checked={g('store') === s._id} onChange={() => set('store', s._id)} />{s.name}</label>)}
      <h4>Price range · up to ₹{(+g('maxPrice') || 5000).toLocaleString('en-IN')}</h4><input type="range" min="300" max="5000" step="100" value={g('maxPrice') || 5000} onChange={(e) => set('maxPrice', e.target.value === '5000' ? '' : e.target.value)} />
      <button className="btn ghost sm full mt" onClick={() => setSp({})}>Clear all</button></aside>
    <div><div className="row between"><h1>Products {data && <small className="muted" style={{ fontSize: '.9rem' }}>({data.total})</small>}</h1>
      <div className="row"><button className="btn ghost sm fbtn" onClick={() => setFo(!fo)}>Filters</button><select value={g('sort')} onChange={(e) => set('sort', e.target.value)}><option value="">Newest</option><option value="price">Price: low to high</option><option value="-price">Price: high to low</option><option value="-rating">Rating</option><option value="-reviewsCount">Popular</option></select></div></div>
      {err && <div className="alert">{err}</div>}<div className="grid g4 mt">{!data && !err && Array.from({ length: 6 }, (_, i) => <div key={i} className="sk" />)}{data?.items.map((p) => <ProductCard key={p._id} p={p} />)}</div>
      {data && !data.items.length && <div className="empty"><h3>No products found</h3><p className="muted">Try changing your filters.</p></div>}
      {data?.pages > 1 && <div className="row center mt">{Array.from({ length: data.pages }, (_, i) => <button key={i} className={`btn sm ${page === i + 1 ? '' : 'ghost'}`} onClick={() => set('page', String(i + 1))}>{i + 1}</button>)}</div>}</div></div></div>);
}
