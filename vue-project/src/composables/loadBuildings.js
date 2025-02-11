import request from "@/utils/request"

export function loadBuildings() {
    return request.get("load_building").then((buildingData)=>{
        return buildingData.data[0].geojson.features
    })
}