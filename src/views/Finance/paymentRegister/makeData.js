export const data = [
  {
    Voucher: "1",
    VoucherDate: "20/02/2022",
    Account: "9091",
    Pay: "1000",
    Currency: "1000",
    Exrate: "1",
    Amount: "5",
    AmountLc: "5",
  },
  {
    Voucher: "2",
    VoucherDate: "30/08/2022",
    Account: "9087",
    Pay: "1000",
    Currency: "1000",
    Exrate: "1",
    Amount: "5",
    AmountLc: "5",
  },

  // Add more sample data objects as needed...
];

// Function to generate sample data
export function makeData(count = 20) {
  const newData = [];
  for (let i = 1; i <= count; i++) {
    newData.push({
      id: i,
      commodityCategory: `First ${i}`,
      creator: `Last ${i}`,
      createTime: `email${i}@example.com`,
    });
  }
  return newData;
}
