const MAP = [
  ['mug|cup', 'mug'],
  ['bottle', 'bottle'],
  ['backpack|bag', 'backpack'],
  ['tee|t-shirt|shirt', 'tee'],
  ['jean|denim', 'jeans'],
  ['sneaker|shoe|runner', 'sneakers'],
  ['watch', 'watch'],
  ['serum', 'serum'],
  ['sunscreen|spf', 'sunscreen'],
  ['moistur|cream|gel', 'moisturizer'],
  ['lipstick|makeup|lip', 'lipstick'],
  ['earbud|headphone|earphone', 'earbuds'],
  ['power ?bank', 'powerbank'],
  ['band|fitness', 'band'],
  ['lamp|light', 'lamp'],
  ['bedsheet|bed', 'bedsheet'],
];

export const byName = (name = '') => {
  const n = name.toLowerCase();

  const m = MAP.find(([k]) => new RegExp(k).test(n));

  return `/products/${m ? m[1] : 'bottle'}.jpg`;
};

export const productImage = (p) => byName(p?.name);