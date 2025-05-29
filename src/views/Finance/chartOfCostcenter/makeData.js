export const data = [
  {
    CostcenterCode: 'BTM',
    CostcenterName: 'BTM',
    Credit: '100',
    Debit: '100'
  },
  {
    CostcenterCode: 'ECITY',
    CostcenterName: 'ECITY',
    Credit: '200',
    Debit: '200'
  }

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
      createTime: `email${i}@example.com`
    });
  }
  return newData;
}
