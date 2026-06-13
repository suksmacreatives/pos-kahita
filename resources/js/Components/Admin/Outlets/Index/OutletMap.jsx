import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function OutletMap({ outlets = [] }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [-8.34, 115.09],
      zoom: 10,
      scrollWheelZoom: false,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const markers = [];

    outlets.forEach((outlet) => {
      const lat = parseFloat(outlet.latitude);
      const lng = parseFloat(outlet.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      const color = outlet.warna_hex || '#10B981';

      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(map);

      marker.bindTooltip(outlet.nama || 'Outlet', {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
        className: 'outlet-tooltip',
      });

      marker.bindPopup(`
        <div style="font-size:12px;font-weight:600;color:#111827">${outlet.nama || 'Outlet'}</div>
        ${outlet.kota ? `<div style="font-size:10px;color:#6b7280;margin-top:2px">${outlet.kota}</div>` : ''}
        <div style="font-size:10px;color:#6b7280;margin-top:2px">${outlet.tipe || 'cabang'} · ${outlet.status || '-'}</div>
      `);

      if (outlet.status === 'aktif') {
        const pulse = L.circleMarker([lat, lng], {
          radius: 14,
          color: color,
          weight: 2,
          opacity: 0.4,
          fillOpacity: 0.1,
          fillColor: color,
        }).addTo(map);

        markers.push(pulse);

        const animate = () => {
          const el = pulse.getElement();
          if (el) {
            el.style.animation = 'outlet-ping 2s ease-in-out infinite';
          }
        };
        setTimeout(animate, 100);
      }

      markers.push(marker);
    });

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.15));
    }

    return () => {
      markers.forEach((m) => map.removeLayer(m));
    };
  }, [outlets]);

  return (
    <>
      <style>{`
        .outlet-tooltip {
          background: #111827 !important;
          color: white !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 4px 10px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
        .outlet-tooltip::before {
          border-top-color: #111827 !important;
        }
        @keyframes outlet-ping {
          0% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.1; transform: scale(1.5); }
          100% { opacity: 0.4; transform: scale(1); }
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
      <div
        ref={mapRef}
        className="w-full h-[350px] rounded-xl overflow-hidden isolate"
      />
    </>
  );
}
