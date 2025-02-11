export function priceChange(currPrice: number, prevClosePrice: number) {
    const change = parseFloat((((currPrice - prevClosePrice) / prevClosePrice) * 100).toFixed(2))
    return [change, change > 0]
}