export const data = [
  {
    SNo: "1",
    voucherNo: "10101",
    voucherDate: "30/12/2023",
    rcvdFrom: "Karupu",
    currency: "Ruppes",
    exRate: "100",
    amt: "200",
    amt_lc: "500",
  },
  {
    SNo: "2",
    voucherNo: "10101",
    voucherDate: "30/12/2023",
    rcvdFrom: "Karupu",
    currency: "Ruppes",
    exRate: "100",
    amt: "200",
    amt_lc: "500",
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
