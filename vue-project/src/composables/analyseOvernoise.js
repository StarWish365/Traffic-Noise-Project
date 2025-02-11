export function analyzeOverNoise(building) {
    if (!building || !building.receivers) return "No available data";

    let countOver20 = 0;
    let countOver10 = 0;
    const pop = building.pop
    Object.values(building.receivers).forEach(receiver => {
        if (receiver.overNoisecount > 20) {
            countOver20++;
        } else if (receiver.overNoisecount > 10) {
            countOver10++;
        }
    });
    countOver10 = Math.floor(countOver10 * pop)
    countOver20 = Math.floor(countOver20 * pop)
    return `${countOver20} people have overNoisecount exceeding 20, ${countOver10} people have overNoisecount exceeding 10`;
}
