/**
 * Konum donusum servisi.
 *
 * Mobil cihazdan gelen GPS koordinatlari (latitude/longitude) genellikle
 * harita uygulamalarinda (Google Maps, Leaflet, Mapbox, OSM) Web Mercator
 * projeksiyonu (EPSG:3857) ile metre cinsinden x/y olarak kullanilir.
 *
 * Bu modul:
 *   - latLonToXY: lat/lon -> Web Mercator x/y (metre)
 *   - xyToLatLon: Web Mercator x/y -> lat/lon
 *   - toGeoJSON : MongoDB 2dsphere indeksiyle uyumlu GeoJSON Point ([lon, lat])
 *   - haversineDistance: iki nokta arasi yer kuresinde (metre) mesafe
 */

// WGS84 yer kuresi yari capi (metre)
const R = 6378137;
const MAX_LAT = 85.05112878; // Web Mercator'da kullanilabilir maksimum enlem

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad) {
  return (rad * 180) / Math.PI;
}

function parseCoord(v) {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v))) return Number(v);
  return NaN;
}

/**
 * Latitude/longitude dogrulama. Hatali ise null doner.
 */
function validateLatLon(lat, lon) {
  const la = parseCoord(lat);
  const lo = parseCoord(lon);
  if (!Number.isFinite(la) || !Number.isFinite(lo)) return null;
  if (la < -90 || la > 90) return null;
  if (lo < -180 || lo > 180) return null;
  return { lat: la, lon: lo };
}

/**
 * Lat/Lon -> Web Mercator (EPSG:3857) x, y (metre).
 */
function latLonToXY(lat, lon) {
  const v = validateLatLon(lat, lon);
  if (!v) throw Object.assign(new Error('Gecersiz lat/lon'), { status: 400 });
  // Web Mercator kutuplarda sonsuza gider; +-85.05 ile sinirlandir
  const clampedLat = Math.max(Math.min(v.lat, MAX_LAT), -MAX_LAT);
  const x = R * toRad(v.lon);
  const y = R * Math.log(Math.tan(Math.PI / 4 + toRad(clampedLat) / 2));
  return { x, y };
}

/**
 * Web Mercator x, y (metre) -> Lat/Lon.
 */
function xyToLatLon(x, y) {
  const xn = parseCoord(x);
  const yn = parseCoord(y);
  if (!Number.isFinite(xn) || !Number.isFinite(yn)) {
    throw Object.assign(new Error('Gecersiz x/y'), { status: 400 });
  }
  const lon = toDeg(xn / R);
  const lat = toDeg(2 * Math.atan(Math.exp(yn / R)) - Math.PI / 2);
  return { lat, lon };
}

/**
 * Lat/Lon -> GeoJSON Point. MongoDB 2dsphere indeksiyle uyumlu (lon, lat sirasi!).
 */
function toGeoJSON(lat, lon) {
  const v = validateLatLon(lat, lon);
  if (!v) throw Object.assign(new Error('Gecersiz lat/lon'), { status: 400 });
  return { type: 'Point', coordinates: [v.lon, v.lat] };
}

/**
 * Haversine formulu ile iki nokta arasindaki kus ucusu mesafesi (metre).
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const a = validateLatLon(lat1, lon1);
  const b = validateLatLon(lat2, lon2);
  if (!a || !b) throw Object.assign(new Error('Gecersiz koordinatlar'), { status: 400 });
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const sa = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(sa), Math.sqrt(1 - sa));
  return R * c;
}

module.exports = {
  latLonToXY,
  xyToLatLon,
  toGeoJSON,
  haversineDistance,
  validateLatLon,
  R
};
