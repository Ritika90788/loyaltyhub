import { useState } from 'react'; import { useLocation, useNavigate } from 'react-router-dom'; import api, { errMsg } from '../services/api'; import { useApp } from '../context/AppContext';
export default function Login() {
  const { login, notify } = useApp(); const nav = useNavigate(); const loc = useLocation(); const [reg, setReg] = useState(!!new URLSearchParams(location.search).get('ref')); const [f, setF] = useState({ name: '', email: '', password: '' }); const [err, setErr] = useState('');
  const submit = async (e) => { e.preventDefault(); setErr(''); try { const { data } = await api.post(reg ? '/auth/register' : '/auth/login', { ...f, ref: new URLSearchParams(location.search).get('ref') }); login(data.token, data.user); notify(`Welcome, ${data.user.name}!`); nav(loc.state?.from || '/'); } catch (x) { setErr(errMsg(x)); } };
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (<div className="wrap auth"><form className="card" onSubmit={submit}><h2>{reg ? 'Create your account' : 'Welcome back'}</h2>{reg && <p className="muted">{new URLSearchParams(location.search).get('ref') ? 'You were invited. Sign up to get 1,200 welcome points.' : 'Sign up and get 1,000 welcome points.'}</p>}{err && <div className="alert">{err}</div>}
    {reg && <input placeholder="Full name" value={f.name} onChange={on('name')} required />}<input type="email" placeholder="Email" value={f.email} onChange={on('email')} required />
    <input type="password" placeholder="Password (6+ characters)" value={f.password} onChange={on('password')} required minLength={6} />
    <button className="btn full lg">{reg ? 'Sign up' : 'Sign in'}</button><button type="button" className="link" onClick={() => setReg(!reg)}>{reg ? 'Have an account? Sign in' : 'New here? Create account'}</button></form></div>);
}
