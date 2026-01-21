export interface RouteCoordinate {
  lat: number;
  lng: number;
}

export async function fetchRouteOSRM(
  stations: RouteCoordinate[]
): Promise<RouteCoordinate[]> {
  if (stations.length < 2) return stations;
  
  const coordinates = stations.map(s => `${s.lng},${s.lat}`).join(';');
  
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
    );
    
    if (!response.ok) {
      console.error('OSRM routing failed');
      return stations;
    }
    
    const data = await response.json();
    
    const routeCoords = data.routes[0].geometry.coordinates.map((coord: number[]) => ({
      lat: coord[1],
      lng: coord[0]
    }));
    
    return routeCoords;
  } catch (error) {
    console.error('Error fetching OSRM route:', error);
    return stations;
  }
}