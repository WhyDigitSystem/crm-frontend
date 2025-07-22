import { Box, Button, Card, CardActions, CardContent, Divider, Paper, Stack, Typography } from '@mui/material';

const notifications = [
  {
    name: 'John Doe',
    expenceId: 'EXP123',
    docDate: '11-12-2024',
    amount: 2500.5,
    currency: 'USD',
    heading: 'TAX INVOICE'
  },
  {
    name: 'Jane Smith',
    expenceId: 'EXP124',
    docDate: '11-10-2024',
    amount: 1750.75,
    currency: 'EUR',
    heading: 'CREDIT NOTE'
  }
];

const NotificationList = () => {
  const renderNotificationCard = (item) => (
    <Card
      sx={{
        mb: 1,
        borderRadius: 2,
        backgroundColor: '#ffffff',
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
        }
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        {' '}
        {/* Reduced padding-bottom */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#343a40' }}>
            {item.heading}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {item.docDate}
          </Typography>
        </Stack>
        <Divider sx={{ my: 1.5 }} />
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Name:{' '}
          <Typography variant="body1" component="span" sx={{ fontWeight: '500' }}>
            {item.name}
          </Typography>
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Expense ID:{' '}
          <Typography variant="body1" component="span" sx={{ fontWeight: '500' }}>
            {item.expenceId}
          </Typography>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Amount:{' '}
          <Typography variant="body1" component="span" sx={{ fontWeight: '500' }}>
            {item.amount} {item.currency}
          </Typography>
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0, pb: 1, mb: 1 }}>
        {' '}
        {/* Reduced padding-top */}
        <Button size="small" variant="contained" color="success" sx={{ borderRadius: 20, px: 3 }}>
          Approve
        </Button>
        <Button size="small" variant="contained" color="error" sx={{ borderRadius: 20, px: 3 }}>
          Reject
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 4,
        maxWidth: 600,
        margin: 'auto',
        backgroundColor: '#ffffff',
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>
        Notifications
      </Typography> */}
      {/* <Divider sx={{ mb: 3 }} /> */}
      <Stack spacing={2}>
        {' '}
        {/* Reduced spacing between cards */}
        {notifications.map((notification, index) => (
          <Box key={index}>{renderNotificationCard(notification)}</Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default NotificationList;
