import request from "@/utils/request"

export function loadBuildings() {
    return request.get("load_building")
}