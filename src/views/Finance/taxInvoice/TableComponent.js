import { Edit } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
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
  Stack,
  TextField,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MaterialReactTable } from 'material-react-table';
import { useCallback, useMemo, useRef, useState } from 'react';

const TableComponent = ({ tableData: initialTableData, onCreateNewRow }) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tableData, setTableData] = useState(initialTableData || []);
  const [validationErrors, setValidationErrors] = useState({});

  const theme = useTheme();
  const anchorRef = useRef(null);

  const handleCreateNewRow = (values) => {
    setTableData((prevData) => {
      const newData = [...prevData, values];
      onCreateNewRow(values); // Pass values to parent component immediately
      return newData;
    });
  };

  const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
    const newValidationErrors = {};
    // Validate all fields to ensure they are not empty
    Object.keys(values).forEach((key) => {
      if (!values[key]) {
        newValidationErrors[key] = `${key} is required`;
      }
    });
    // Validate the Qty field to ensure it's an integer
    if (!validateInteger(values.qty)) {
      newValidationErrors['qty'] = 'Qty must be a valid integer';
    }

    if (!validateInteger(values.billAmount)) {
      newValidationErrors['billAmount'] = 'billAmount must be a valid integer';
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
      if (!window.confirm(`Are you sure you want to delete ${row.getValue('firstName')}`)) {
        return;
      }
      // send api delete request here, then refetch or update local table data for re-render
      tableData.splice(row.index, 1);
      setTableData([...tableData]);
    },
    [tableData]
  );

  const getCommonEditTextFieldProps = useCallback(
    (cell) => ({
      error: !!validationErrors[cell.id],
      helperText: validationErrors[cell.id],
      onBlur: (event) => {
        const isValid = validateRequired(event.target.value);
        if (!isValid) {
          // set validation error for cell if invalid
          setValidationErrors({
            ...validationErrors,
            [cell.id]: `${cell.column.columnDef.header} is required`
          });
        } else {
          // remove validation error for cell if valid
          const newValidationErrors = { ...validationErrors };
          delete newValidationErrors[cell.id];
          setValidationErrors(newValidationErrors);
        }
      }
    }),
    [validationErrors]
  );

  const columns = useMemo(
    () => [
      { accessorKey: 'type', header: 'Type', size: 140 },
      { accessorKey: 'chargeCode', header: 'Charge Code', size: 140 },
      { accessorKey: 'gchargeCode', header: 'Gcharge Code', size: 140 },
      { accessorKey: 'chargeName', header: 'Charge Name', size: 140 },
      { accessorKey: 'taxable', header: 'Taxable', size: 140 },
      { accessorKey: 'qty', header: 'Qty', size: 140 },
      { accessorKey: 'rate', header: 'Rate', size: 140 },
      { accessorKey: 'currency', header: 'Currency', size: 140 },
      { accessorKey: 'exRate', header: 'Ex Rate', size: 140 },
      { accessorKey: 'fcAmount', header: 'FC Amount', size: 140 },
      { accessorKey: 'lcAmount', header: 'IC Amount', size: 140 },
      { accessorKey: 'billAmount', header: 'Bill Amount', size: 140 },
      { accessorKey: 'sac', header: 'SAC', size: 140 },
      { accessorKey: 'gstpercent', header: 'GST%', size: 140 },
      { accessorKey: 'gst', header: 'GST', size: 140 }
    ],
    []
  );

  return (
    <>
      <MaterialReactTable
        displayColumnDefOptions={{
          'mrt-row-actions': {
            muiTableHeadCellProps: { align: 'center' },
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
          <Box sx={{ display: 'flex', gap: '0.1rem', justifyContent: 'flex-end' }}>
            <Tooltip arrow placement="left" title="Delete">
              <IconButton color="error" onClick={() => handleDeleteRow(row)}>
                <ButtonBase sx={{ borderRadius: '12px', marginRight: '5px' }}>
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
                    <DeleteIcon size="1.2rem" stroke={1.5} />
                  </Avatar>
                </ButtonBase>
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement="right" title="Edit">
              <IconButton onClick={() => table.setEditingRow(row)}>
                <ButtonBase sx={{ borderRadius: '12px', marginRight: '5px' }}>
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
                    <Edit size="1.3rem" stroke={1.5} />
                  </Avatar>
                </ButtonBase>
              </IconButton>
            </Tooltip>
          </Box>
        )}
        renderTopToolbarCustomActions={() => (
          <Stack direction="row" spacing={2} className="ml-5">
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

const CreateNewAccountModal = ({ open, columns, onClose, onSubmit }) => {
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

  const integerFields = ['billAmount', 'exRate', 'fcAmount', 'gst', 'gstpercent', 'id', 'lcAmount', 'qty', 'rate'];

  const handleSubmit = () => {
    const newValidationErrors = {};
    // Validate all fields to ensure they are not empty
    Object.keys(values).forEach((key) => {
      if (!values[key]) {
        newValidationErrors[key] = `${key} is required`;
      }
    });
    // Validate the Qty field to ensure it's an integer
    if (!validateInteger(values.qty)) {
      newValidationErrors['qty'] = 'Qty must be a valid integer';
    }
    if (!validateInteger(values.billAmount)) {
      newValidationErrors['billAmount'] = 'billAmount must be a valid integer';
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
                type={integerFields.includes(column.accessorKey) ? 'number' : 'text'}
                required
                inputProps={integerFields.includes(column.accessorKey) ? { step: 1, min: 0 } : {}}
                onChange={(e) => handleChange(e, column.accessorKey)}
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

const validateInteger = (value) => Number.isInteger(Number(value));

const validateRequired = (value) => {
  return !!value.trim(); // Example: Checks if value is not empty after trimming whitespace
};

export default TableComponent;
