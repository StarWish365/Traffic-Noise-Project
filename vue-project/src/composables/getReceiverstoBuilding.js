import request from "@/utils/request"

export function getReceiverstoBuilding(store) {
    request.get("get_receivers_to_building").then(res => {
        const result = {}
        res.data.forEach(({ idreceive, bg_pk, pop }) => {
            const buildingID = `building${bg_pk}`
            const receiverID = `receiver${idreceive}`
            if (!result[buildingID]) {
                result[buildingID] = {
                    highlight: 0,  // 默认不高亮
                    pop: pop,          // 将 pop 移到 buildingID 层级
                    sum: 0,
                    receivers: {}      // 存储 receiver 数据
                };
            }

            // 添加 receiver 数据
            result[buildingID].receivers[receiverID] = {
                'id': idreceive,
                'overNoisecount': 0
            };
        })
        store.receiverstoBuilding = result

        /* console.log(store.receiverstoBuilding) */
    })
}

export function processNoiseData(store, time) {
    return request.get(`get_receivers_to_building_time?time=${time}`).then(queryResults => {
        const result = {}
        queryResults.data.forEach(({ building_id, population, receiver_id, over_noisecount, building_sum }) => {
            const buildingKey = `building${building_id}`
            const receiverKey = `receiver${receiver_id}`

            if (!result[buildingKey]) {
                let highlight = 0

                // 根据 sum 的值设置 highlight
                if (building_sum >= 500 && building_sum < 1000) {
                    highlight = 1
                } else if (building_sum >= 1000 && building_sum < 1500) {
                    highlight = 2
                } else if (building_sum >= 1500) {
                    highlight = 3
                }
                result[buildingKey] = {
                    highlight: highlight,
                    pop: population,
                    sum: building_sum,  // 直接赋值为 SQL 中计算好的总和
                    receivers: {}
                }
            }

            result[buildingKey].receivers[receiverKey] = {
                id: receiver_id,
                overNoisecount: over_noisecount
            }
        })
        console.log(result)

        store.receiverstoBuilding = result
    })
}