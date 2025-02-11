export function priceChange(currPrice, prevClosePrice) {
    const change=(((currPrice - prevClosePrice)/prevClosePrice) * 100).toFixed(2)
    return [change, change>0]
}