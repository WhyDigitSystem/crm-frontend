export const data = [
    {
      SNo: "1",
      FromDate: "11/01/2022",
      ToDate: "22/05/2022",
      Tcs: "1",
    },
    {
        SNo: "2",
        FromDate: "17/07/2022",
        ToDate: "19/08/2022",
        Tcs: "9",
    },
    {
        SNo: "3",
        FromDate: "22/02/2022",
        ToDate: "03/01/2023",
        Tcs: "12",
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
  