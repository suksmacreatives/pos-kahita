import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

export default function Barcode({
  value,
  format = 'CODE128',
  width = 2,
  height = 38,
  displayValue = true,
  fontSize = 12,
  className = '',
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !value) return;
    try {
      JsBarcode(ref.current, value, {
        format,
        width,
        height,
        displayValue,
        fontSize,
        margin: 0,
        background: 'transparent',
        lineColor: '#111827',
      });
    } catch {
      console.warn('Gagal render barcode untuk:', value);
    }
  }, [value, width, height, displayValue, fontSize, format]);

  if (!value) return null;
  return <svg ref={ref} className={className} />;
}