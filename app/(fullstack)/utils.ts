export const formatMoney = (num: number) =>
  "$ " + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
