import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Box, Chip, Grid, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MaterialReactTable } from 'material-react-table';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import ActionButton from 'utils/ActionButton';
import dayjs from 'dayjs';

const CommonTableWithStatus = ({
  data = [],
  columns = [],
  blockEdit,
  toEdit,
  disableEditIcon,
  isPdf,
  GeneratePdf,
  enableEditing,
  summaryData = []
}) => {
  const [tableData, setTableData] = useState(data);
  const theme = useTheme();

  const chipSX = { height: 24, padding: '0 6px' };
  const chipSuccessSX = { ...chipSX, color: theme.palette.success.dark, backgroundColor: theme.palette.success.light, height: 28 };
  const chipErrorSX = { ...chipSX, color: theme.palette.orange.dark, backgroundColor: theme.palette.orange.light, marginRight: '5px' };

  const handleButtonClick = (row) => toEdit?.(row);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const customColumns = columns.map((column) => {
    if (column.accessorKey?.toLowerCase().includes('date')) {
      return {
        ...column,
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return value ? dayjs(value).format('DD-MM-YYYY') : '-';
        }
      };
    }
    if (column.accessorKey === 'active') {
      return {
        ...column,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue() === 'Active' ? 'Active' : 'In-Active'}
            sx={cell.getValue() === 'Active' ? chipSuccessSX : chipErrorSX}
          />
        )
      };
    }
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

  const renderRowActions = ({ row }) => (
    <Box sx={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
      {isPdf && <ActionButton title="Pdf" icon={PictureAsPdfIcon} onClick={() => GeneratePdf?.(row)} />}
      {!disableEditIcon && <ActionButton title="Edit" icon={EditIcon} onClick={() => handleButtonClick(row)} />}
    </Box>
  );

  return (
    <>
      {/* ✅ Dynamic Summary Section with animation */}
      {summaryData?.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            {summaryData.map(({ label, count, color, icon }, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.1 }}>
                  <Paper
                    elevation={4}
                    component={motion.div}
                    whileHover={{ scale: 1.04 }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2.5,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${color}15, #ffffff)`,
                      borderLeft: `6px solid ${color}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: `0 6px 20px ${color}55`,
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#555', fontWeight: 500 }}>
                        {label}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#111' }}>
                        <CountUp start={0} end={count ?? 0} duration={1.2} separator="," />
                      </Typography>
                    </Box>
                    <Box sx={{ fontSize: 34 }}>{icon}</Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ✅ Table Section */}
      <MaterialReactTable
        columns={customColumns.map((col) => ({
          ...col,
          muiTableHeadCellProps: {
            sx: {
              backgroundColor: '#f3f4f6',
              color: '#111827',
              fontWeight: 'bold',
              fontSize: '13px',
              textAlign: 'left',
              borderBottom: '2px solid #e5e7eb',
              padding: '10px 12px'
            }
          },
          muiTableBodyCellProps: {
            sx: {
              fontSize: '14px',
              color: '#111827',
              padding: '10px 12px',
              borderBottom: '1px solid #e5e7eb'
            }
          }
        }))}
        data={tableData}
        enableEditing
        renderRowActions={renderRowActions}
        initialState={{ density: 'compact' }}
        muiTableContainerProps={{
          sx: {
            background: '#ffffff',
            borderRadius: '5px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }
        }}
        muiTableBodyRowProps={{
          sx: {
            height: '50px',
            '&:nth-of-type(even)': { backgroundColor: '#f9fafb' },
            '&:hover': {
              backgroundColor: '#f3f4f6',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              transition: '0.2s ease-in-out'
            }
          }
        }}
      />
    </>
  );
};

export default CommonTableWithStatus;
