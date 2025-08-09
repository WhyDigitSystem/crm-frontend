import React, { useState } from 'react';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { download, generateCsv, mkConfig } from 'export-to-csv';
import { MaterialReactTable } from 'material-react-table';
import dayjs from 'dayjs';
import ActionButton from 'utils/ActionButton';
import { useTheme } from '@mui/material/styles';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { borderTop, padding, textAlign } from '@mui/system';
import { Paper, IconButton } from '@mui/material';

const formatDate = (value) => (value ? dayjs(value).format('DD-MM-YYYY') : '-');

const CommonReportTable = ({
  columns,
  data,
  isListView,
  fileName,
  handleDownloadExcel,
  handleDownloadPdf,
  sumFields = [],
  headerFields = [],
  filters = [], // [{ label, value, options, onChange }]
  onFilterDone = () => { }
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();

  const chipSX = { height: 24, padding: '0 6px' };
  const chipSuccessSX = {
    ...chipSX,
    color: theme.palette.success.dark,
    backgroundColor: theme.palette.success.light,
    height: 18,
    fontSize: '11px'
  };
  const chipErrorSX = {
    ...chipSX,
    color: theme.palette.warning.dark,
    backgroundColor: theme.palette.warning.light,
    marginRight: '5px',
    height: 18,
    fontSize: '10px',
    textAlign: 'center'
  };
  const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
    filename: fileName
  });

  const handleExportData = () => {
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
  };

  const sums = sumFields.reduce((acc, field) => {
    acc[field] = data.reduce((total, row) => total + parseFloat(row[field] || 0), 0);
    return acc;
  }, {});

  const sumFieldLabels = {
    TotalInvAmountLC: 'Total Amount',
    TotalTaxAmountLC: 'Tax Amount',
    TotalAmount: 'Total Amount',
    Tax: 'Tax Amount',
    BillAmount: 'Bill Amount',
    outstanding: 'OutStanding'
  };

  const customColumns = columns.map((column) => {
    // if (column.accessorKey?.toLowerCase().includes('date')) {
    //   return {
    //     ...column,
    //     Cell: ({ cell }) => formatDate(cell.getValue());
    //     //

    //   };
    // }

    if (column.accessorKey?.toLowerCase().includes('date')) {
      return {
        ...column,
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return value ? formatDate(value) : ''; // Only format if value exists
        }
      };
    }

    if (column.accessorKey === 'active') {
      return {
        ...column,
        Cell: ({ cell }) => (
          <Chip label={cell.getValue() === true ? 'Active' : 'Inactive'} sx={cell.getValue() === true ? chipSuccessSX : chipErrorSX} />
        )
      };
    }
    // if (column.accessorKey === 'status') {
    //   return {
    //     ...column,
    //     Cell: ({ cell }) => (
    //       <Chip label={cell.getValue() === 'SUBMIT' ? 'SUBMIT' : 'EDIT'} sx={cell.getValue() === 'SUBMIT' ? chipSuccessSX : chipErrorSX} />
    //     )
    //   };
    // }
    if (column.accessorKey === 'closed') {
      return {
        ...column,
        Cell: ({ cell }) => (
          <Chip label={cell.getValue() === 'Yes' ? 'Yes' : 'No'} sx={cell.getValue() === 'Yes' ? chipSuccessSX : chipErrorSX} />
        )
      };
    }
    return column;
  });

  const customLocalization = {
    toggleDensity: 'Wide View'
  };

  return (
    <>
      <Paper elevation={3} sx={{ borderRadius: 2, padding: 2 }}>
        <MaterialReactTable
          data={data}
          columns={customColumns.map((col) => ({
            ...col,
            muiTableHeadCellProps: {
              sx: {
                position: 'sticky',
                top: 0,
                zIndex: 10,
                backgroundColor: '#111827',
                boxShadow: '0px 2px 6px rgba(0,0,0,0.2)',
                color: 'white'
              }
            },
            muiTableBodyCellProps: {
              sx: {
                fontSize: '11px',
                color: 'white',
                borderBottom: '1px solid #e5e7eb54',
                borderTop: '1px solid #e5e7eb54',
                borderRight: '1px solid #797979',
                borderLeft: '1px solid #000000ff',
                padding: '2px 4px'
              }
            }
          }))}
          enableColumnOrdering={false}
          enableColumnActions={false}
          enableFullScreenToggle={true}
          initialState={{ density: 'compact' }}
          localization={customLocalization}
          muiTableContainerProps={{
            sx: {
              width: '100vw',
              maxWidth: '100%',
              maxHeight: '100%',
              background: 'transparent',
              borderRadius: '10px',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              // border: '1px solid #E5E7EB'
            }
          }}
          muiTableProps={{
            sx: {
              backgroundColor: 'transparent',
              color: 'white',
              borderRadius: '10px',
              overflow: 'hidden',
              // border: '1px solid #E5E7EB'
            }
          }}
          muiTableBodyRowProps={{
            sx: {
              '&:hover': {
                backgroundColor: '#1f2937',
                transform: 'scale(1.01)',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
              },
            },
          }}
          renderTopToolbarCustomActions={({ table }) => (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {/* <ActionButton
                  title="Excel"
                  icon={FileDownloadIcon}
                  onClick={handleDownloadExcel}
                  sx={{
                    backgroundColor: '#2E7D32',
                    color: 'white',
                    '&:hover': {
                      transform: 'scale(1.01)',
                      backgroundColor: '#B71C1C',
                      transition: 'all 0.2s ease-in-out'
                    }

                  }}
                />
                <ActionButton
                  title="PDF"
                  icon={PictureAsPdfIcon}
                  onClick={handleDownloadPdf}
                  sx={{
                    backgroundColor: '#D32F2F',
                    color: 'white',
                    '&:hover': {
                      transform: 'scale(1.01)',
                      backgroundColor: '#B71C1C',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                /> */}
                <IconButton
                  onClick={handleDownloadExcel}
                  sx={{ backgroundColor: '#16a34a', color: 'white', '&:hover': { backgroundColor: '#15803d' } }}
                >
                  <FileDownloadIcon />
                </IconButton>
                <IconButton
                  onClick={handleDownloadPdf}
                  sx={{ backgroundColor: '#dc2626', color: 'white', '&:hover': { backgroundColor: '#b91c1c' } }}
                >
                  <PictureAsPdfIcon />
                </IconButton>
              </Box>
            </Box>
          )}
        />
      </Paper>
    </>
  );
};

export default CommonReportTable;
