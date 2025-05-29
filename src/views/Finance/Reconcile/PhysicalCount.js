import { Box, Grid, TextField, Typography } from '@mui/material';
import React, { useEffect } from 'react';

const denominations = [
  { value: 2000, label: '2000', countKey: 'dn1', amountKey: 'dn1Amt' },
  { value: 500, label: '500', countKey: 'dn2', amountKey: 'dn2Amt' },
  { value: 200, label: '200', countKey: 'dn3', amountKey: 'dn3Amt' },
  { value: 100, label: '100', countKey: 'dn4', amountKey: 'dn4Amt' },
  { value: 50, label: '50', countKey: 'dn5', amountKey: 'dn5Amt' },
  { value: 20, label: '20', countKey: 'dn6', amountKey: 'dn6Amt' },
  { value: 10, label: '10', countKey: 'dn7', amountKey: 'dn7Amt' },
  { value: 1, label: 'Change', countKey: 'dn8', amountKey: 'dn8Amt' }
];

const PhysicalCountComponent = ({ expectedAmount = 0, formData, setFormData }) => {
  // Handle input change for each denomination count
  const handleCountChange = (denomination, value) => {
    const newCount = Number(value);

    // Update both count and the calculated amount in formData
    setFormData((prevFormData) => ({
      ...prevFormData,
      [denomination.countKey]: newCount,
      [denomination.amountKey]: newCount * denomination.value
    }));

    // Recalculate totals when counts change
    calculateTotals({
      ...formData,
      [denomination.countKey]: newCount,
      [denomination.amountKey]: newCount * denomination.value
    });
  };

  // Calculation of total physical amount and difference amount
  const calculateTotals = (updatedFormData) => {
    let totalAmount = 0;

    // Calculate total physical amount based on all denomination amounts
    denominations.forEach((denomination) => {
      totalAmount += updatedFormData[denomination.amountKey];
    });

    // Update formData with the calculated totals
    setFormData((prevFormData) => ({
      ...prevFormData,
      totalPhyAmount: totalAmount,
      differenceAmount: totalAmount - expectedAmount
    }));
  };

  useEffect(() => {
    // Initially calculate totals based on formData values
    calculateTotals(formData);
  }, []);

  return (
    <Box p={2} sx={{ maxWidth: '600px', margin: 'auto' }}>
      <Typography variant="h6" align="center">
        Physical Count
      </Typography>
      <Grid container spacing={2} alignItems="center">
        {/* Table headers */}
        <Grid item xs={6}>
          <Typography variant="subtitle1">Count</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1">Amount</Typography>
        </Grid>

        {/* Denominations input and amount calculation */}
        {denominations.map((denom) => (
          <React.Fragment key={denom.value}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label={denom.label}
                value={formData[denom.countKey]}
                onChange={(e) => handleCountChange(denom, e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="text" value={formData[denom.amountKey].toFixed(2)} disabled />
            </Grid>
          </React.Fragment>
        ))}

        {/* Total Physical Amount */}
        <Grid item xs={6}>
          <Typography variant="subtitle1">Total Physical Amount</Typography>
        </Grid>
        <Grid item xs={6}>
          <TextField fullWidth type="text" value={formData.totalPhyAmount.toFixed(2)} disabled />
        </Grid>

        {/* Difference Amount */}
        <Grid item xs={6}>
          <Typography variant="subtitle1">Difference Amount</Typography>
        </Grid>
        <Grid item xs={6}>
          <TextField fullWidth type="text" value={formData.differenceAmount.toFixed(2)} disabled />
        </Grid>

        {/* Remarks */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Remarks"
            multiline
            rows={3}
            value={formData.remarks}
            onChange={(e) =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                remarks: e.target.value
              }))
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PhysicalCountComponent;
