export const data = [
    {
      SNo: "1",
      Accountname: "Hari",
      Subledger: "9091",
      Debit: "1000",
      Credit: "1000",
      DebitBase: "1",
      CreditBase: "5",
    },
    {
        SNo: "2",
        Accountname: "Moni",
        Subledger: "4356",
        Debit: "2000",
        Credit: "2000",
        DebitBase: "4",
        CreditBase: "2",
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
        createTime: `email${i}@example.com`,
      });
    }
    return newData;
  }
  