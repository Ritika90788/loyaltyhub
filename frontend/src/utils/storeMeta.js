export const storeMeta = { ShopKart: ['', '#dbeafe'], StyleHub: ['', '#fce7f3'], GlowMart: ['', '#fbe0ee'], TechZone: ['', '#dbeafe'], HomeNest: ['', '#fef3c7'] };
export const meta = (n) => storeMeta[n] || ['', '#ede9fe'];
export const storeImg = (n = '') => `/stores/${n.toLowerCase().replace(/\W/g, '')}.svg`;
