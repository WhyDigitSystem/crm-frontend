import { MaterialReactTable } from 'material-react-table';
import { useEffect, useMemo, useState } from 'react';

const GstTable = ({ tableData: initialTableData }) => {
  const [tableData, setTableData] = useState(initialTableData || []);

  useEffect(() => {
    // Update tableData when initialTableData changes
    if (Array.isArray(initialTableData) && initialTableData.length > 0) {
      console.log('Updated tableData:', initialTableData); // Check if initialTableData is received correctly
      setTableData(initialTableData);
    } else {
      console.log('initialTableData is empty or not an array');
    }
  }, [initialTableData]);

  // Add serial number (SNO) to each row
  const dataWithSno = useMemo(() => {
    return tableData.map((row, index) => ({
      sno: index + 1, // Auto-increment SNO starting from 1
      ...row
    }));
  }, [tableData]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'sno', // Serial number column
        header: 'SNO',
        size: 80
      },
      {
        accessorKey: 'gstChargeAcc',
        header: 'GST Party A/C',
        size: 140
      },
      {
        accessorKey: 'gstSubledgerCode',
        header: 'GST Subledger Code',
        size: 140
      },
      {
        accessorKey: 'gstDbBillAmount',
        header: 'GST DB Bill Amount',
        size: 140
      },
      {
        accessorKey: 'gstCrBillAmount',
        header: 'GST CR Bill Amount',
        size: 140
      },
      {
        accessorKey: 'gstDbLcAmount',
        header: 'GST DB LC Amount',
        size: 140
      },
      {
        accessorKey: 'gstCrLcAmount',
        header: 'GST CR LC Amount',
        size: 140
      }
    ],
    []
  );

  return (
    <>
      <MaterialReactTable
        columns={columns}
        data={dataWithSno} // Pass data with SNO column
        editingMode="modal"
        enableColumnOrdering
      />
    </>
  );
};

export default GstTable;
