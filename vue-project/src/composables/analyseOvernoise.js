export function analyzeOverNoise(building) {
    if (!building || !building.receivers) return "No available data";

    let countOver20 = 0;
    let countOver10 = 0;
    let countOver1 = 0
    const pop = building.pop
    Object.values(building.receivers).forEach(receiver => {
        if (receiver.overNoisecount > 50) {
            countOver20++;
        } else if (receiver.overNoisecount > 25) {
            countOver10++;
        } else if (receiver.overNoisecount > 1) {
            countOver1++
        }
    });
    countOver1 = Math.floor(countOver1 * pop)
    countOver10 = Math.floor(countOver10 * pop)
    countOver20 = Math.floor(countOver20 * pop)
    return [countOver1, countOver10, countOver20]
}
