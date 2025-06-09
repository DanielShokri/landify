const expressMaps = require('express');

const mapsRouter = expressMaps.Router();

// GET /api/google-maps/places/autocomplete
mapsRouter.get('/places/autocomplete', async (req: any, res: any): Promise<any> => {
  try {
    const { input } = req.query;

    if (!input || typeof input !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Input parameter is required'
      });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Google Maps API key not configured'
      });
    }

    // Make request to Google Places API
    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.append('input', input);
    url.searchParams.append('types', 'establishment');
    url.searchParams.append('key', apiKey);

    const response = await fetch(url.toString());
    const data: any = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Google Maps API error',
        message: data.error_message || 'Unknown error'
      });
    }

    res.json(data);

  } catch (error: any) {
    console.error('Google Maps autocomplete error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch autocomplete suggestions'
    });
  }
});

// GET /api/google-maps/places/search
mapsRouter.get('/places/search', async (req: any, res: any): Promise<any> => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Query parameter is required'
      });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Google Maps API key not configured'
      });
    }

    // Make request to Google Places Text Search API
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.append('query', query);
    url.searchParams.append('type', 'establishment');
    url.searchParams.append('key', apiKey);

    const response = await fetch(url.toString());
    const data: any = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Google Maps API error',
        message: data.error_message || 'Unknown error'
      });
    }

    res.json(data);

  } catch (error: any) {
    console.error('Google Maps search error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to search places'
    });
  }
});

// GET /api/google-maps/places/details/:placeId
mapsRouter.get('/places/details/:placeId', async (req: any, res: any): Promise<any> => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Place ID is required'
      });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Google Maps API key not configured'
      });
    }

    // Make request to Google Places Details API
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.append('place_id', placeId);
    url.searchParams.append('fields', [
      'name',
      'formatted_address',
      'formatted_phone_number',
      'website',
      'business_status',
      'opening_hours',
      'types',
      'geometry',
      'rating',
      'user_ratings_total',
      'reviews',
      'photos'
    ].join(','));
    url.searchParams.append('key', apiKey);

    const response = await fetch(url.toString());
    const data: any = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Google Maps API error',
        message: data.error_message || 'Unknown error'
      });
    }

    res.json(data);

  } catch (error: any) {
    console.error('Google Maps place details error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch place details'
    });
  }
});

module.exports = { googleMapsRouter: mapsRouter };
