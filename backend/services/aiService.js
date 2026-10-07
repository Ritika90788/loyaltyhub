const { GoogleGenerativeAI } = require('@google/generative-ai'); const { Product } = require('../models'); const { httpError } = require('../middleware/auth');
const MODELS = [process.env.GEMINI_MODEL, 'gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3-flash-preview'].filter(Boolean);
// Tries each model in turn (Google retires models often); logs the real error in the server terminal.
const generate = async (prompt) => {
  let last;
  for (const m of MODELS) {
    try { return (await new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({ model: m }).generateContent(prompt)).response.text(); }
    catch (e) { last = e; console.error(`Gemini (${m}) failed:`, e.message); }
  }
  throw last;
};
exports.shoppingAssistant = async (message, user) => {
  // Fetch real products first; Gemini may only recommend from this list.
  const words = message.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  const budget = (message.match(/(?:under|below|₹)\s*(\d{3,6})/i) || [])[1];
  const q = { stock: { $gt: 0 } }; if (budget) q.price = { $lte: +budget };
  const rx = words.map((w) => new RegExp(w, 'i'));
  let products = await Product.find({ ...q, $or: [{ name: { $in: rx } }, { tags: { $in: rx } }, { category: { $in: rx } }] }).limit(8).lean();
  if (!products.length) products = await Product.find(q).sort('-rating').limit(8).lean();
  const ctx = products.map((p) => ({ id: p._id, name: p.name, brand: p.brand, price: p.price, category: p.category }));
  const prompt = `You are LoyaltyAI, a shopping assistant for LoyaltyHub. Use ONLY the products below. Never invent products or prices. The user has ${user.loyaltyPoints} points (10 points = ₹1). Reply in under 80 words, then end with a line "IDS: id1,id2" listing recommended product ids.\nPRODUCTS: ${JSON.stringify(ctx)}\nUSER: ${message}`;
  try {
    const text = (await generate(prompt));
    const ids = ((text.match(/IDS:\s*(.*)$/m) || [])[1] || '').split(',').map((s) => s.trim());
    return { reply: text.replace(/IDS:.*$/m, '').trim(), products: products.filter((p) => ids.includes(String(p._id))) };
  } catch { throw httpError(503, 'LoyaltyAI is unavailable right now. Please try again shortly.'); }
};
exports.campaign = async ({ name, store, product, discount, audience, tone, event }) => {
  const prompt = `Write a marketing campaign. Return ONLY JSON with keys headline, description, promoMessage, socialCaption, cta.\nCampaign: ${name}; Store: ${store}; Product: ${product}; Discount: ${discount}; Audience: ${audience}; Tone: ${tone}; Event: ${event || 'none'}`;
  try { return JSON.parse((await generate(prompt)).replace(/```json|```/g, '').trim()); }
  catch { throw httpError(503, 'Could not generate the campaign. Please try again.'); }
};
