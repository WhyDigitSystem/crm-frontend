import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Tooltip } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import React, { useCallback, useMemo, useState } from 'react';
// import { CSVLink } from 'react-csv';
// import { data } from './makeData';

const data = [
  {
    SNo: '1',
    type: 'Goods',
    chapter: 'Chreals',
    code: '10101',
    description: 'Testing Data',
    rate: '1000',
    excempted: 'Yes'
  },
  {
    SNo: '2',
    type: 'Goods',
    chapter: 'Chreals',
    code: '202020',
    description: 'Testing Data',
    rate: '2000',
    excempted: 'No'
  }

  // Add more sample data objects as needed...
];

const HsnSacCodesListing = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tableData, setTableData] = useState(() => data);
  const [validationErrors, setValidationErrors] = useState({});

  const handleCreateNewRow = (values) => {
    tableData.push(values);
    setTableData([...tableData]);
  };

  //   const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
  //     if (!Object.keys(validationErrors).length) {
  //       tableData[row.index] = values;
  //       //send/receive api updates here, then refetch or update local table data for re-render
  //       setTableData([...tableData]);
  //       exitEditingMode(); //required to exit editing mode and close modal
  //     }
  //   };

  //   const handleCancelRowEdits = () => {
  //     setValidationErrors({});
  //   };

  const exportDataAsCSV = () => {
    // Format your data to be exported as CSV (tableData in this case)
    // For example, transform your data into an array of arrays or objects
    // that represents rows and columns in the CSV file format
    // In this example, we'll use the tableData directly assuming it's in the right format for CSV export
    // You might need to modify the data structure to fit CSVLink requirements
    // Define CSV headers
    // const headers = [
    //   { label: 'S No', key: 'SNo' },
    //   { label: 'Type', key: 'Type' },
    //   { label: 'Chapter', key: 'Chapter' },
    //   { label: 'Code', key: 'Code' },
    //   { label: 'Description', key: 'Description' },
    //   { label: 'Rate', key: 'Rate' },
    //   { label: 'Excempted (Yes/No)', key: 'Excempted (Yes/No)' }
    // ];
    // return (
    //   <CSVLink data={csvData} headers={headers} filename={'table_data.csv'}>
    //     <p>
    //       <img src={process.env.REACT_APP_EXPORT_ICON} style={{ width: '30px' }} />
    //     </p>
    //   </CSVLink>
    // );
  };

  //   const handleDeleteRow = useCallback(
  //     (row) => {
  //       if (
  //         // eslint-disable-next-line no-restricted-globals
  //         !confirm(`Are you sure you want to delete ${row.getValue('firstName')}`)
  //       ) {
  //         return;
  //       }
  //       //send api delete request here, then refetch or update local table data for re-render
  //       tableData.splice(row.index, 1);
  //       setTableData([...tableData]);
  //     },
  //     [tableData]
  //   );

  const getCommonEditTextFieldProps = useCallback(
    (cell) => {
      return {
        error: !!validationErrors[cell.id],
        helperText: validationErrors[cell.id],
        onBlur: (event) => {
          const isValid =
            cell.column.id === 'email'
              ? validateEmail(event.target.value)
              : cell.column.id === 'age'
                ? validateAge(+event.target.value)
                : validateRequired(event.target.value);
          if (!isValid) {
            //set validation error for cell if invalid
            setValidationErrors({
              ...validationErrors,
              [cell.id]: `${cell.column.columnDef.header} is required`
            });
          } else {
            //remove validation error for cell if valid
            delete validationErrors[cell.id];
            setValidationErrors({
              ...validationErrors
            });
          }
        }
      };
    },
    [validationErrors]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: 'SNo',
        header: 'S No',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'type',
        header: 'Type',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'chapter',
        header: 'Chapter',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'code',
        header: 'Code',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'description',
        header: 'Description',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'Rate',
        header: 'Rate',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'excempted',
        header: 'Excempted (Yes/No)',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      }
    ],
    [getCommonEditTextFieldProps]
  );

  return (
    <>
      <MaterialReactTable
        displayColumnDefOptions={{
          'mrt-row-actions': {
            muiTableHeadCellProps: {
              align: 'center'
            },
            size: 120
          }
        }}
        columns={columns}
        data={tableData}
        editingMode="modal"
        enableColumnOrdering
        // enableEditing
        // onEditingRowSave={handleSaveRowEdits}
        // onEditingRowCancel={handleCancelRowEdits}
        // renderRowActions={({ row, table }) => (
        //   <Box
        //     sx={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}
        //   >
        //     <Tooltip arrow placement="left" title="Delete">
        //       <IconButton color="error" onClick={() => handleDeleteRow(row)}>
        //         <Delete />
        //       </IconButton>
        //     </Tooltip>
        //     <Tooltip arrow placement="right" title="Edit">
        //       <IconButton onClick={() => table.setEditingRow(row)}>
        //         <Edit />
        //       </IconButton>
        //     </Tooltip>
        //   </Box>
        // )}
        renderTopToolbarCustomActions={() => (
          <Stack direction="row" spacing={2} className="ml-5 ">
            {/* <Tooltip title="Add">
                <div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setCreateModalOpen(true)}
                  >
                    Add
                  </button>
                </div>
              </Tooltip> */}
            <Tooltip title="Export Data as CSV">
              <span>{exportDataAsCSV()}</span>
            </Tooltip>
          </Stack>
        )}
      />
      <CreateNewAccountModal
        columns={columns}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateNewRow}
      />
    </>
  );
};

//example of creating a mui dialog modal for creating new rows
export const CreateNewAccountModal = ({ open, columns, onClose, onSubmit }) => {
  const [values, setValues] = useState(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ''] = '';
      return acc;
    }, {})
  );

  const handleSubmit = () => {
    //put your validation logic here
    onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={open}>
      <DialogTitle textAlign="center">Add</DialogTitle>
      <DialogContent>
        <form onSubmit={(e) => e.preventDefault()}>
          <Stack
            sx={{
              width: '100%',
              minWidth: { xs: '300px', sm: '360px', md: '400px' },
              gap: '1.5rem'
            }}
          >
            {columns.map((column) => (
              <TextField
                key={column.accessorKey}
                label={column.header}
                name={column.accessorKey}
                onChange={(e) => setValues({ ...values, [e.target.name]: e.target.value })}
              />
            ))}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="secondary" onClick={handleSubmit} variant="contained">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const validateRequired = (value) => !!value.length;
const validateEmail = (email) =>
  !!email.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
const validateAge = (age) => age >= 18 && age <= 50;

export default HsnSacCodesListing;
