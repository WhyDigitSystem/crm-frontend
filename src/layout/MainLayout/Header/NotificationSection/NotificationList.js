import dayjs from 'dayjs';
import { Box, Typography, Paper, Stack, Chip } from '@mui/material';
import customParseFormat from 'dayjs/plugin/customParseFormat';
const NotificationList = ({ notifications = [] }) => {
  dayjs.extend(customParseFormat);
  // const formatDate = (date) =>
  // dayjs(date, 'DD-MM-YYYY hh:mm:ss A').format('DD MMM • hh:mm A');
  const formatDate = (date) => {
    const parsed = dayjs(date, 'DD-MM-YYYY hh:mm:ss A');
    const now = dayjs();

    const minutes = now.diff(parsed, 'minute');
    const hours = now.diff(parsed, 'hour');
    const days = now.diff(parsed, 'day');

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} day ago`;

    return parsed.format('DD MMM • hh:mm A'); // fallback
  };

  if (!notifications.length) {
    return (
      <Typography align="center" sx={{ p: 3, color: '#94a3b8' }}>
        No notifications
      </Typography>
    );
  }

  return (
    <Box sx={{ width: 320, px: 1.5, py: 1 }}>
      <Stack spacing={1.5}>
        {notifications.map((item) => {
          // const isUnread = item.status === 'UNREAD';
          const notificationType = item.notificationType === 'LEAD';

          return (
            <Paper
              key={item.id}
              elevation={0}
              sx={{
                p: 1,
                borderRadius: 3,
                cursor: 'pointer',
                position: 'relative',
                backgroundColor: '#eef2ff',
                //  backgroundColor: isUnread ? '#eef2ff' : '#ffffff',
                border: '1px solid #e2e8f0',
                // borderLeft: isUnread
                //   ? '4px solid #6366f1'
                //   : '4px solid transparent',
                borderLeft: '4px solid #6366f1',
                transition: 'all 0.25s ease',

                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                  // backgroundColor: isUnread ? '#e0e7ff' : '#f8fafc'
                  backgroundColor: '#e0e7ff'
                }
              }}
            >
              {/* {isUnread && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#ef4444'
                  }}
                />
              )} */}

              {/* HEADER */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                {/* <Chip
                  label={item.status}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: 10,
                    fontWeight: 600,
                    backgroundColor: isUnread
                      ? '#c7d2fe'
                      : '#e2e8f0',
                    color: isUnread ? '#3730a3' : '#475569'
                  }}
                /> */}
                <Chip
                  label={item.notificationType}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: 10,
                    fontWeight: 600,
                    // backgroundColor: '#c7d2fe',

                    // color: '#3730a3'
                    backgroundColor: notificationType ? '#EEF2FF' : '#F9FAFB',
                    color: notificationType ? '#4338CA' : '#64748B'
                  }}
                />

                <Typography
                  sx={{
                    fontSize: 10,
                    color: '#94a3b8'
                  }}
                >
                  {formatDate(item?.commonDate?.createdon)}
                </Typography>
              </Box>

              {/* <Stack spacing={1}>
                <Field label="Message" value={item.message} bold />             
              </Stack> */}

              <Typography
                sx={{
                  color: '#1e293b',
                  fontWeight: 500,
                  lineHeight: 1.4,
                  fontSize: 12
                }}
              >
                {item.message}
              </Typography>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};

const Field = ({ label, value, bold }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: '110px 1fr',
      alignItems: 'start',
      gap: 1
    }}
  >
    <Typography
      fontSize={11}
      sx={{
        color: '#64748b',
        fontWeight: 500
      }}
    >
      {label}
    </Typography>

    <Typography
      fontSize={13}
      sx={{
        color: '#1e293b',
        fontWeight: bold ? 600 : 500,
        lineHeight: 1.4
      }}
    >
      {value || '-'}
    </Typography>
  </Box>
);

export default NotificationList;
