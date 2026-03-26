export function getSequence(values) {
    const predecessors = values.slice();
    const result = [];
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (value < 0) {
            continue;
        }
        if (result.length === 0 || values[result[result.length - 1]] < value) {
            predecessors[i] = result.length > 0 ? result[result.length - 1] : -1;
            result.push(i);
            continue;
        }
        let start = 0;
        let end = result.length - 1;
        while (start < end) {
            const middle = (start + end) >> 1;
            if (values[result[middle]] < value) {
                start = middle + 1;
            }
            else {
                end = middle;
            }
        }
        if (value < values[result[start]]) {
            if (start > 0) {
                predecessors[i] = result[start - 1];
            }
            else {
                predecessors[i] = -1;
            }
            result[start] = i;
        }
    }
    let length = result.length;
    let last = length > 0 ? result[length - 1] : -1;
    while (length-- > 0 && last >= 0) {
        result[length] = last;
        last = predecessors[last];
    }
    return result;
}
//# sourceMappingURL=sequence.js.map