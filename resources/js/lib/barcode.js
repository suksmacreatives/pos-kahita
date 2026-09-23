export function printBarcodeLabels({
  productIds,
  qty = 1,
  mode = 'per_produk',
  includePrice = true,
  labelSize = '50x25',
}) {
  const query = new URLSearchParams();
  productIds.forEach((id) => query.append('product_ids[]', id));
  query.append('qty', String(qty));
  query.append('mode', mode);
  query.append('include_price', includePrice ? '1' : '0');
  query.append('label_size', labelSize);

  const url = `${route('admin.products.barcode-label')}?${query.toString()}`;
  return window.open(url, '_blank');
}