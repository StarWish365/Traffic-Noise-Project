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

export function convertToGeoJSON(noisePoints) {
    return {
        "type": "FeatureCollection",
        "features": noisePoints.map(point => ({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [point.lon, point.lat] // 经度在前，纬度在后
            },
            "properties": {
                "val": point.val // 噪声值
            }
        }))
    };
}
