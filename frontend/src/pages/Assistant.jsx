import { SIZES } from '../utils/variants';
import { productImage } from '../utils/productImage';
import { useState, useRef, useEffect } from 'react'; import { Link } from 'react-router-dom'; import api, { errMsg } from '../services/api'; import { useApp } from '../context/AppContext'; import { money } from '../components/ProductCard';
const chips = ['What can I buy under ₹2000?', 'Suggest a college outfit', 'Find skincare for a simple routine', 'I have 500 points. What can I redeem?', 'Suggest a gift under ₹1500'];
export default function Assistant() {
  const { addToCart, user } = useApp(); const [msgs, setMsgs] = useState([{ role: 'ai', text: "Hi! I'm LoyaltyAI. I can help you find products, suggest gifts and use your points. What are you looking for today?" }]); const [text, setText] = useState(''); const [busy, setBusy] = useState(false); const end = useRef();
  useEffect(() => { if (end.current && end.current.scrollIntoView) end.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [msgs, busy]);
  const send = async (m) => { m = (m ?? text).trim(); if (!m || busy) return; setText(''); setMsgs((x) => [...x, { role: 'me', text: m }]); setBusy(true);
    try { const { data } = await api.post('/ai/shopping-assistant', { message: m }); setMsgs((x) => [...x, { role: 'ai', text: data.reply, products: data.products }]); }
    catch (e) { setMsgs((x) => [...x, { role: 'ai', text: errMsg(e), err: true }]); } finally { setBusy(false); } };
  return (<div className="wrap sec chat"><div className="row"><span className="bot">AI</span><div><h1>AI Shopping Assistant</h1><p className="muted">Recommends only real products from our stores. {user && `You have ${user.loyaltyPoints} points.`}</p></div></div>
    <div className="msgs">{msgs.map((m, i) => <div key={i} className={`m ${m.role}`}><div className={`bub ${m.err ? 'bad' : ''}`}>{m.text}</div>
      {m.products?.length > 0 && <div className="grid g4 mt">{m.products.map((p) => <div key={p._id} className="card rec"><img src={productImage(p)} alt="" /><b>{p.name}</b><span className="muted">{money(p.price)}</span><div className="row">{SIZES[p.category] ? <Link className="btn sm" to={`/products/${p._id}`}>Choose size</Link> : <button className="btn sm" onClick={() => addToCart(p)}>Add to cart</button>}<Link className="btn ghost sm" to={`/products/${p._id}`}>View</Link></div></div>)}</div>}</div>)}
      {busy && <div className="m ai"><div className="bub">Thinking…</div></div>}<div ref={end} /></div>
    <div className="row">{chips.map((c) => <button key={c} className="chip" onClick={() => send(c)}>{c}</button>)}</div>
    <div className="row mt"><input className="grow" placeholder="Type your message…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} /><button className="btn" disabled={busy} onClick={() => send()}>Send</button></div></div>);
}
