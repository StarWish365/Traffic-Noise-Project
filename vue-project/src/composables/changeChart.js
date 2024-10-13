import axios from 'axios'

export function getNextNoise(idreceiver, time, HeadValue) {
    // 创建请求体数据
    const params = {
        idreceiver: idreceiver,
        time: time
    };
    // 使用 Axios 请求后端接口
    axios.get('http://localhost:3000/api/get_next_noise', { params })
        .then((response) => {
            const laeq = Number(response.data.rows[0].laeq)
            console.log('服务器返回的数据:', laeq)
            HeadValue.addHistoryEntry(laeq);
            // 处理返回的数据，例如更新地图上的图层或显示数据
        })
        .catch((error) => {
            console.error('请求失败:', error);
        });
}
