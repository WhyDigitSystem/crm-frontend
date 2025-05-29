import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MaterialReactTable } from 'material-react-table';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ActionButton from 'utils/ActionButton';

const TableComponent = ({ formValues, setFormValues }) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  const theme = useTheme();
  const anchorRef = useRef(null);

  console.log('tableTest', tableData);

  useEffect(() => {
    if (formValues.listOfValues1DTO) {
      setTableData(formValues.listOfValues1DTO);
    }
  }, [formValues]);

  const handleCreateNewRow = (values) => {
    const updatedListOfValues = [...tableData, { ...values, sno: tableData.length + 1 }];
    setTableData(updatedListOfValues);
    setFormValues((prev) => ({
      ...prev,
      listOfValues1DTO: updatedListOfValues
    }));
  };

  const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
    if (!Object.keys(validationErrors).length) {
      const updatedListOfValues = tableData.map((item, index) => (index === row.index ? { ...values, sno: row.index + 1 } : item));
      setTableData(updatedListOfValues);
      setFormValues((prev) => ({
        ...prev,
        listOfValues1DTO: updatedListOfValues
      }));
      exitEditingMode();
    }
  };

  const handleCancelRowEdits = () => {
    setValidationErrors({});
  };

  const handleDeleteRow = useCallback(
    (row) => {
      const updatedListOfValues = tableData.filter((_, index) => index !== row.index).map((item, index) => ({ ...item, sno: index + 1 }));
      setTableData(updatedListOfValues);
      setFormValues((prev) => ({
        ...prev,
        listOfValues1DTO: updatedListOfValues
      }));
    },
    [tableData, setFormValues]
  );

  const getCommonEditTextFieldProps = useCallback(
    (cell) => ({
      error: !!validationErrors[cell.id],
      helperText: validationErrors[cell.id],
      onBlur: (event) => {
        const isValid = cell.column.id === 'email' ? validateEmail(event.target.value) : validateRequired(event.target.value);
        if (!isValid) {
          setValidationErrors((prev) => ({
            ...prev,
            [cell.id]: `${cell.column.columnDef.header} is required`
          }));
        } else {
          delete validationErrors[cell.id];
          setValidationErrors((prev) => ({
            ...prev
          }));
        }
      }
    }),
    [validationErrors]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: 'sno',
        header: 'S No',
        size: 80,
        enableEditing: false // Disable editing for S No as it is auto-generated
      },
      {
        accessorKey: 'valueCode',
        header: 'Value Code',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => getCommonEditTextFieldProps(cell)
      },
      {
        accessorKey: 'valueDescription',
        header: 'Value Description',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => getCommonEditTextFieldProps(cell)
      },
      {
        accessorKey: 'active',
        header: 'Active',
        size: 140,
        Cell: ({ cell }) => (
          <Switch
            checked={cell.getValue()}
            onChange={(e) => {
              const updatedListOfValues = tableData.map((item, index) =>
                index === cell.row.index ? { ...item, active: e.target.checked } : item
              );
              setTableData(updatedListOfValues);
              setFormValues((prev) => ({
                ...prev,
                listOfValues1DTO: updatedListOfValues
              }));
            }}
            color="primary"
          />
        ),
        muiTableBodyCellEditTextFieldProps: ({ cell }) => getCommonEditTextFieldProps(cell)
      }
    ],
    [getCommonEditTextFieldProps, tableData, setFormValues]
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
            <ActionButton title="delete" icon={DeleteIcon} onClick={() => handleDeleteRow(row)} />
            <ActionButton title="edit" icon={EditIcon} onClick={() => table.setEditingRow(row)} />
          </Box>
        )}
        renderTopToolbarCustomActions={() => (
          <Stack direction="row" spacing={2} className="ml-5 ">
            <Tooltip title="Add">
              <div>
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
              </div>
            </Tooltip>
          </Stack>
        )}
      />
      <CreateNewAccountModal
        columns={columns.filter((col) => col.accessorKey !== 'sno')}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateNewRow}
      />
    </>
  );
};

export const CreateNewAccountModal = ({ open, columns, onClose, onSubmit }) => {
  const [values, setValues] = useState(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ''] = column.accessorKey === 'active' ? true : '';
      return acc;
    }, {})
  );

  const handleSubmit = () => {
    onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={open}>
      <DialogTitle textAlign="center">Add</DialogTitle>
      <DialogContent>
        <form onSubmit={(e) => e.preventDefault()}>
          <Stack sx={{ width: '100%', minWidth: { xs: '300px', sm: '360px', md: '400px' }, gap: '1.5rem' }}>
            {columns.map((column) =>
              column.accessorKey === 'active' ? (
                <FormControlLabel
                  key={column.accessorKey}
                  control={
                    <Switch
                      checked={values[column.accessorKey]}
                      onChange={(e) => setValues({ ...values, [column.accessorKey]: e.target.checked })}
                      color="primary"
                    />
                  }
                  label={column.header}
                />
              ) : (
                <TextField
                  key={column.accessorKey}
                  label={column.header}
                  name={column.accessorKey}
                  onChange={(e) => setValues({ ...values, [e.target.name]: e.target.value })}
                />
              )
            )}
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

export default TableComponent;
