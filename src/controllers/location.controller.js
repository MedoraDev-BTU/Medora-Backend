const {
  latLonToXY,
  xyToLatLon,
  toGeoJSON,
  haversineDistance
} = require('../services/geoService');

/**
 * POST /api/location/convert
 * body (lat/lon -> x/y icin):   { lat, lon }
 * body (x/y -> lat/lon icin):   { x, y }
 *
 * Mobil uygulamadan gelen GPS koordinati Web Mercator (EPSG:3857) x/y metreye
 * cevrilir; ayrica MongoDB 2dsphere indeksinde kullanilabilen GeoJSON Point
 * formati da ayni cevapta donulur.
 */
exports.convert = (req, res, next) => {
  try {
    const body = req.body || {};
    const hasLatLon = body.lat !== undefined && body.lon !== undefined;
    const hasXY = body.x !== undefined && body.y !== undefined;

    if (!hasLatLon && !hasXY) {
      return res.status(400).json({
        error: 'Istek govdesinde { lat, lon } veya { x, y } bekleniyor'
      });
    }

    if (hasLatLon) {
      const { x, y } = latLonToXY(body.lat, body.lon);
      const lat = Number(body.lat);
      const lon = Number(body.lon);
      return res.json({
        input: { lat, lon },
        projection: 'EPSG:3857 (Web Mercator)',
        xy: { x, y },                            // metre
        geoJSON: toGeoJSON(lat, lon),            // MongoDB 2dsphere uyumlu
        unit: 'meters'
      });
    }

    // hasXY
    const { lat, lon } = xyToLatLon(body.x, body.y);
    return res.json({
      input: { x: Number(body.x), y: Number(body.y) },
      projection: 'EPSG:3857 (Web Mercator) -> WGS84',
      latLon: { lat, lon },
      geoJSON: toGeoJSON(lat, lon)
    });
  } catch (err) {
    if (err && err.status === 400) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

/**
 * POST /api/location/distance
 * body: { from: {lat, lon}, to: {lat, lon} }
 * Iki nokta arasindaki kus ucusu mesafeyi metre olarak doner.
 * (Frontend'in "yakindaki klinik" gibi senaryolarda hizlica kullanmasi icin)
 */
exports.distance = (req, res, next) => {
  try {
    const { from, to } = req.body || {};
    if (!from || !to) {
      return res.status(400).json({ error: 'from ve to objeleri zorunlu' });
    }
    const meters = haversineDistance(from.lat, from.lon, to.lat, to.lon);
    res.json({
      from,
      to,
      meters: Math.round(meters * 100) / 100,
      kilometers: Math.round((meters / 1000) * 100) / 100
    });
  } catch (err) {
    if (err && err.status === 400) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};
