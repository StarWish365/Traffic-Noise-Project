export function createGeoJSON(data) {
    return {
        "type": "FeatureCollection",
        "features": data[0].row_to_json.features.map(feature => ({
            "type": "Feature",
            "geometry": feature.geometry,
            "properties": feature.properties
        }))
    };
}