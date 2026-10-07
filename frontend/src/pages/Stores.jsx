import { useEffect, useState } from 'react'; import { Link } from 'react-router-dom'; import api from '../services/api'; import { meta, storeImg } from '../utils/storeMeta';
export default function Stores() {
  const [s, setS] = useState(null); const [tab, setTab] = useState('All'); const [fail, setFail] = useState(false);
  useEffect(() => { api.get('/stores').then((r) => setS(r.data)).catch(() => { setS([]); setFail(true); }); }, []);
  const cats = ['All', ...new Set((s || []).map((x) => x.category))]; const shown = (s || []).filter((x) => tab === 'All' || x.category === tab);
  return (<div className="wrap sec"><h1>Explore Our Stores</h1><p className="muted mt">One account. One wallet. Multiple shopping experiences.</p>
    <div className="tabs mt">{cats.map((c) => <button key={c} className={tab === c ? 'on' : ''} onClick={() => setTab(c)}>{c === 'All' ? 'All Stores' : c}</button>)}</div>
    {fail && <div className="alert">Cannot reach the server. Make sure the backend is running and the database is seeded.</div>}
    <div className="grid g4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))' }}>{s === null ? [1, 2, 3].map((i) => <div key={i} className="sk" />) : shown.map((x) => { const [ic, bg] = meta(x.name); return (
      <div key={x._id} className="card scard"><div className="cover" style={{ backgroundImage: `url(${storeImg(x.name)})` }}><span className="slogo">{x.name[0]}</span></div>
        <div className="sb"><h2>{x.name}</h2><small className="muted">{x.category}</small><p className="muted">{x.description}</p><Link to={`/products?store=${x._id}`} className="btn full">Explore Store</Link></div></div>); })}</div></div>);
}
