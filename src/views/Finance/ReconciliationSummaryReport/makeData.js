export const data = [
  {
    SNo: "1",
    taxCode: "10101",
    type: "Goods",
    rate: "1000",
    input: "CGST Input",
    output: "CGST Output",
  },
  {
    SNo: "1",
    taxCode: "10101",
    type: "Goods",
    rate: "1000",
    input: "CGST Input",
    output: "CGST Output",
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
