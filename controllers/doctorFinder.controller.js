// controllers/doctorFinder.controller.js
const { supabase } = require('../utils/supabaseClient');

// Find doctors/hospitals near a location
exports.findDoctors = async (req, res) => {
  try {
    console.log('[DoctorFinder] findDoctors - User:', req.user.role, 'ID:', req.user.id);
    const { city, state, latitude, longitude, specialty, radius = 50 } = req.query;
    console.log('[DoctorFinder] Search params:', { city, state, latitude, longitude, specialty, radius });

    let query = supabase
      .from('doctor_locations')
      .select(`
        *,
        doctor:doctors(
          id,
          full_name,
          specialization,
          email,
          hospital
        )
      `);

    // Filter by city if provided
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    // Filter by state if provided
    if (state) {
      query = query.ilike('state', `%${state}%`);
    }

    // Filter by specialty if provided
    if (specialty) {
      query = query.contains('specialties', [specialty]);
    }

    const { data: locations, error } = await query;

    if (error) {
      console.error('[DoctorFinder] Database error:', error);
      throw error;
    }

    console.log('[DoctorFinder] Found', locations?.length || 0, 'locations');

    // If latitude and longitude provided, calculate distances and sort
    let results = locations || [];
    if (latitude && longitude) {
      results = results
        .map(location => {
          if (location.latitude && location.longitude) {
            const distance = calculateDistance(
              parseFloat(latitude),
              parseFloat(longitude),
              parseFloat(location.latitude),
              parseFloat(location.longitude)
            );
            return { ...location, distance };
          }
          return { ...location, distance: null };
        })
        .filter(location => !location.distance || location.distance <= radius)
        .sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
    }

    console.log('[DoctorFinder] Returning', results.length, 'doctors');
    res.json({ success: true, doctors: results });
  } catch (err) {
    console.error('Error finding doctors:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all doctor locations (for map view)
exports.getAllLocations = async (req, res) => {
  try {
    console.log('[DoctorFinder] getAllLocations - User:', req.user.role, 'ID:', req.user.id);
    const { data, error } = await supabase
      .from('doctor_locations')
      .select(`
        *,
        doctor:doctors(
          id,
          full_name,
          specialization,
          email
        )
      `);

    if (error) {
      console.error('[DoctorFinder] Database error:', error);
      throw error;
    }

    console.log('[DoctorFinder] Returning', data?.length || 0, 'locations');
    res.json({ success: true, locations: data || [] });
  } catch (err) {
    console.error('Error fetching doctor locations:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

