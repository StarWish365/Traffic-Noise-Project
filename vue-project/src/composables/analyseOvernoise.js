export function analyzeOverNoise(building) {
    if (!building || !building.receivers) return "无有效数据";

    let countOver20 = 0;
    let countOver10 = 0;

    Object.values(building.receivers).forEach(receiver => {
        if (receiver.overNoisecount > 20) {
            countOver20++;
        } else if (receiver.overNoisecount > 10) {
            countOver10++;
        }
    });

    return `${countOver20} 个 receiver 的 overNoisecount 数量超过 20，${countOver10} 个 receiver 的 overNoisecount 数量超过 10`;
}
