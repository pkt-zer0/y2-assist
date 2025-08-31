//-- Utils --

function compareObj(actual: Record<string, any>, expected: Record<string, any>): string[] {
    const allKeys = [...Object.keys(actual), ...Object.keys(expected)];

    const diffs: Record<string, boolean> = {}; // Could be a Set, but whatever
    for (const key of allKeys) {
        // Treat missing keys as a flag set to false
        if ((actual[key] ?? false) !== (expected[key] ?? false)) {
            diffs[key] = true;
        }
    }

    return Object.keys(diffs);
}
