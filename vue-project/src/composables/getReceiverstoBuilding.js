import request from "@/utils/request"

export function getReceiverstoBuilding() {
    request.get("get_receivers_to_building").then(res => {
        const result = {}
        res.data.forEach(({ idreceive, bg_pk, pop }) => {
            const buildingID = `building${bg_pk}`
            const receiverID = `receiver${idreceive}`
            if (!result[buildingID]){
                result[buildingID] = {}
            }
            result[buildingID][receiverID] = {
                'id': idreceive,
                'pop': pop,
                'overNoisecount':0
            }
        })
        console.log(result)
    })
}