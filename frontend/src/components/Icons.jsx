const P = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
export const IconHeart = () => <svg {...P}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>;
export const IconBell = () => <svg {...P}><path d="M6 17V11a6 6 0 1 1 12 0v6l1.5 2h-15z" /><path d="M10 21h4" /></svg>;
export const IconCart = () => <svg {...P}><path d="M3 4h2l2.4 11h10.2L20 7H6.2" /><circle cx="9" cy="19.5" r="1.3" /><circle cx="17" cy="19.5" r="1.3" /></svg>;
export const IconMenu = () => <svg {...P}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
export const IconSearch = () => <svg {...P} width="18" height="18"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></svg>;
export const IconCheck = () => <svg {...P} width="30" height="30" strokeWidth="2.4"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
export const Stars = ({ n = 0 }) => <span className="starrow">{Array.from({ length: 5 }, (_, i) => <svg key={i} viewBox="0 0 20 20" width="13" height="13" fill={i < n ? '#b8863b' : '#d9cfc2'}><path d="M10 1.5l2.5 5.6 6.1.6-4.6 4.1 1.4 6L10 14.7 4.6 17.8 6 11.8 1.4 7.7l6.1-.6z" /></svg>)}</span>;
