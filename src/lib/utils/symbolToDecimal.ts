export const symbolToDecimal = (symbol: string): number => {
  if (symbol === "USDC" || symbol === "USDT") {
    return 6;
  }
  return 18;
};
