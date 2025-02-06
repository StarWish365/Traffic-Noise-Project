import request from "@/utils/request";

export function getBuildingId(polygonData) {
    const polygon = arrayToPolygon(polygonData);

    /*    console.log(polygon) */

    if (!polygon) {
        console.error("转换后的 POLYGON 数据为空");
        return Promise.reject("无效的 POLYGON 数据");
    }

    return request.get('get_building_id', {
        params: { polygon: polygon }
    });
}

function arrayToPolygon(coordinates) {
    if (!coordinates || coordinates.length === 0) {
        console.error("坐标数据为空");
        return null;
    }

    // 生成 POLYGON WKT 格式
    const polygonWKT = coordinates.map(
        ring => "(" + ring.map(coord => coord.join(" ")).join(", ") + ")"
    ).join(", ");

    return polygonWKT;  // ✅ 确保格式正确
}
