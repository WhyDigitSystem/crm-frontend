import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Box, Chip, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MaterialReactTable } from 'material-react-table';
import { useEffect, useState } from 'react';
import ActionButton from 'utils/ActionButton';

const CommonListViewTable = ({ data, columns, blockEdit, toEdit, disableEditIcon, viewIcon, isPdf, GeneratePdf }) => {
  const [tableData, setTableData] = useState(data || []);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));

  const theme = useTheme();

  const chipSX = {
    height: 24,
    padding: '0 6px'
  };

  const chipSuccessSX = {
    ...chipSX,
    color: theme.palette.success.dark,
    backgroundColor: theme.palette.success.light,
    height: 28
  };

  const chipErrorSX = {
    ...chipSX,
    color: theme.palette.orange.dark,
    backgroundColor: theme.palette.orange.light,
    marginRight: '5px'
  };

  const handleButtonClick = (row) => {
    toEdit(row);
  };

  useEffect(() => {
    console.log('BlockEdit', blockEdit);
  }, []);

  const customColumns = columns.map((column) => {
    if (column.accessorKey === 'active') {
      console.log('the columns are:', column);

      return {
        ...column,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue() === 'Active' ? 'Active' : 'Inactive'}
            sx={cell.getValue() === 'Active' ? chipSuccessSX : chipErrorSX}
          />
        )
      };
    }

    if (column.accessorKey === 'closed') {
      console.log('the columns are:', column);

      return {
        ...column,
        Cell: ({ cell }) => (
          <Chip label={cell.getValue() === 'Yes' ? 'Yes' : 'No'} sx={cell.getValue() === 'Yes' ? chipSuccessSX : chipErrorSX} />
        )
      };
    }

    return column;
  });

  const renderRowActions = ({ row }) => (
    <Box sx={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
      {isPdf && <ActionButton title="Pdf" icon={PictureAsPdfIcon} onClick={() => GeneratePdf(row)} />}
      {!disableEditIcon && <ActionButton title="Edit" icon={EditIcon} onClick={() => handleButtonClick(row)} />}
    </Box>
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
        columns={customColumns}
        data={tableData && tableData}
        enableColumnOrdering
        enableEditing
        renderRowActions={renderRowActions}
        renderTopToolbarCustomActions={() => <Stack direction="row" spacing={2} className="ml-5 "></Stack>}
      />
    </>
  );
};

export default CommonListViewTable;
