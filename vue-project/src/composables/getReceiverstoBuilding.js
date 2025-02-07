import request from "@/utils/request"

export function getReceiverstoBuilding(store) {
    request.get("get_receivers_to_building").then(res => {
        const result = {}
        res.data.forEach(({ idreceive, bg_pk, pop }) => {
            const buildingID = `building${bg_pk}`
            const receiverID = `receiver${idreceive}`
            if (!result[buildingID]) {
                result[buildingID] = {
                    highlight: false,  // 默认不高亮
                    pop: pop,          // 将 pop 移到 buildingID 层级
                    sum:0,
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
/*         const result = new Map();

        res.data.forEach(({ idreceive, bg_pk, pop }) => {
            const buildingID = `building${bg_pk}`;
            const receiverID = `receiver${idreceive}`;

            if (!result.has(buildingID)) {
                result.set(buildingID, new Map());
            }

            result.get(buildingID).set(receiverID, {
                id: idreceive,
                pop: pop,
                overNoisecount: 0
            });
        });

        // 存储到 store
        store.receiverstoBuilding = result; */

        console.log(store.receiverstoBuilding)
    })
}