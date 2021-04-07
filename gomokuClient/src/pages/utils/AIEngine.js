function AIEngine(colorState) {
    var i = 0;
    while (colorState[i] === 'w' || colorState[i] === 'b') {
        i += 1;
    }
    return i;
}

export default AIEngine
