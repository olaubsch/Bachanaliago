const colors = ["#ee6055", "#acd8aa", "#aaf683", "#ffd97d", "#ff9b85", "#f48498"];

export const assignUserColors = (users) => {
    const colorMap = {};
    users.forEach((user) => {
        colorMap[user._id] = colors[Math.floor(Math.random() * colors.length)];
    });
    return colorMap;
};
