import { Delete, Edit } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MaterialReactTable } from 'material-react-table';
import { useCallback, useMemo, useRef, useState } from 'react';

const GstTable = ({ tableData: initialTableData, onCreateNewRow }) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tableData, setTableData] = useState(initialTableData || []);
  const [validationErrors, setValidationErrors] = useState({});

  const theme = useTheme();
  const anchorRef = useRef(null);

  const handleCreateNewRow = (values) => {
    setTableData((prevData) => {
      const newData = [...prevData, values];
      onCreateNewRow(values);
      return newData;
    });
  };

  const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
    const newValidationErrors = {};
    Object.keys(values).forEach((key) => {
      if (!values[key]) {
        newValidationErrors[key] = `${key} is required`;
      }
    });

    if (!validateInteger(values.gstdbBillAmount)) {
      newValidationErrors['gstdbBillAmount'] = 'Qty must be a valid integer';
    }

    if (!Object.keys(newValidationErrors).length) {
      tableData[row.index] = values;
      setTableData([...tableData]);
      exitEditingMode(); // required to exit editing mode and close modal
    } else {
      setValidationErrors(newValidationErrors);
    }
  };

  const handleCancelRowEdits = () => {
    setValidationErrors({});
  };

  const handleDeleteRow = useCallback(
    (row) => {
      if (
        // eslint-disable-next-line no-restricted-globals
        !confirm(`Are you sure you want to delete ${row.getValue('firstName')}`)
      ) {
        return;
      }
      //send api delete request here, then refetch or update local table data for re-render
      tableData.splice(row.index, 1);
      setTableData([...tableData]);
    },
    [tableData]
  );

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
        accessorKey: 'gstPartyAc',
        header: 'GST Party A/C',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'gstSubledgerCode',
        header: 'Gst Subledger Code',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'gstdbBillAmount',
        header: 'GST DB Bill Amount',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'gstcrBillAmount',
        header: 'GST CR Bill Amount',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'gstDbLcAmount',
        header: 'GST DB LC Amount',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'gstCrLcAmount',
        header: 'GST CR LC Amount',
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
        enableEditing
        onEditingRowSave={handleSaveRowEdits}
        onEditingRowCancel={handleCancelRowEdits}
        renderRowActions={({ row, table }) => (
          <Box sx={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Tooltip arrow placement="left" title="Delete">
              <IconButton color="error" onClick={() => handleDeleteRow(row)}>
                <Delete />
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement="right" title="Edit">
              <IconButton onClick={() => table.setEditingRow(row)}>
                <Edit />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        renderTopToolbarCustomActions={() => (
          <Stack direction="row" spacing={2} className="ml-5 ">
            <Tooltip title="Add">
              <ButtonBase sx={{ borderRadius: '12px', marginRight: '10px' }} onClick={() => setCreateModalOpen(true)}>
                <Avatar
                  variant="rounded"
                  sx={{
                    ...theme.typography.commonAvatar,
                    ...theme.typography.mediumAvatar,
                    transition: 'all .2s ease-in-out',
                    background: theme.palette.secondary.light,
                    color: theme.palette.secondary.dark,
                    '&[aria-controls="menu-list-grow"],&:hover': {
                      background: theme.palette.secondary.dark,
                      color: theme.palette.secondary.light
                    }
                  }}
                  ref={anchorRef}
                  aria-haspopup="true"
                  color="inherit"
                >
                  <AddIcon size="1.3rem" stroke={1.5} />
                </Avatar>
              </ButtonBase>
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

  const handleChange = (e, accessorKey) => {
    const value = e.target.value;
    if (integerFields.includes(accessorKey)) {
      // Allow only numeric values
      if (/^\d*$/.test(value)) {
        setValues({ ...values, [e.target.name]: value });
      }
    } else {
      setValues({ ...values, [e.target.name]: value });
    }
  };

  const [validationErrors, setValidationErrors] = useState({}); // Define validationErrors state

  const integerFields = ['gstPartyAc', 'gstdbBillAmount', 'gstcrBillAmount', 'gstDbLcAmount', 'gstCrLcAmount'];

  const handleSubmit = () => {
    const newValidationErrors = {};
    // Validate all fields to ensure they are not empty
    // Object.keys(values).forEach((key) => {
    //   if (!values[key]) {
    //     newValidationErrors[key] = `${key} is required`;
    //   }
    // });
    if (!values.gstSubledgerCode) {
      newValidationErrors['gstSubledgerCode'] = 'GST SubLedger Code is Required';
    }
    if (!validateNumber(values.gstPartyAc)) {
      newValidationErrors['gstPartyAc'] = 'Party AC must be a valid Integer';
    }
    if (!validateNumber(values.gstdbBillAmount)) {
      newValidationErrors['gstdbBillAmount'] = 'GST Debit Bill Amount must be a valid integer';
    }
    if (!validateNumber(values.gstcrBillAmount)) {
      newValidationErrors['gstcrBillAmount'] = 'GST Credit Bill Amount must be a valid integer';
    }
    if (!validateNumber(values.gstDbLcAmount)) {
      newValidationErrors['gstDbLcAmount'] = 'GST Debit LC Amount must be a valid integer';
    }
    if (!validateNumber(values.gstCrLcAmount)) {
      newValidationErrors['gstCrLcAmount'] = 'GST Credit LC Amount must be a valid integer';
    }

    if (!Object.keys(newValidationErrors).length) {
      onSubmit(values);
      onClose();
    } else {
      setValidationErrors(newValidationErrors); // Set validation errors if there are any
    }
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
                error={!!validationErrors[column.accessorKey]} // Set error state based on validation
                helperText={validationErrors[column.accessorKey]}
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

// const validateRequired = (value) => !!value.length;
const validateEmail = (email) =>
  !!email.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
const validateAge = (age) => age >= 18 && age <= 50;

const validateInteger = (value) => Number.isInteger(Number(value));

const validateNumber = (value) => {
  const number = Number(value);
  return !Number.isNaN(number);
};

const validateRequired = (value) => {
  return !!value.trim(); // Example: Checks if value is not empty after trimming whitespace
};

export default GstTable;
