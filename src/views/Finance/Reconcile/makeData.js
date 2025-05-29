export const data = [
  {
    SNo: "1",
    VoucherNo: "1",
    VoucherDate: "1",
    ChqDDNO: "1",
    ChqDDDt: "1",
    ClearedDate: "1",
    PaymentAmt: "1",
    PaymentName: "1",
    Narration: "1",
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
