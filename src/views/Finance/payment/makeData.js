export const data = [
  {
    SNo: "1",
    Accountname: "Hari",
    Subledger: "9091",
    Debit: "0.00",
    Credit: "0.00",
    narration: "1",
  },
  {
    SNo: "2",
    Accountname: "Moni",
    Subledger: "4356",
    Debit: "0.11",
    Credit: "0.55",
    narration: "4",
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
