export function style(props: {}) {
    const attributeValue = Object.entries(props)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ');
    return `style="${attributeValue}"`;
}

export function when(condition: boolean | number, template: string): string {
    return condition ? template : '';
}

export function starsFor(difficulty: number) {
    const filler = 5 - difficulty;
    return '★'.repeat(difficulty) + '☆'.repeat(filler);
}
