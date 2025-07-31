import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Divider,
  Chip
} from '@mui/material';
import TrendingDownIcon from '@mui/icons-material/TrendingDown'; // Updated icon

// Sample Data for Lost Opportunities
const lostOpportunities = [
  { name: 'Manager User', team: 'Unassigned', count: 2 },
  { name: 'Simba Well', team: 'Unassigned', count: 1 },
  { name: 'Sales User', team: "Manager's Team", count: 1 },
  { name: 'Marshall Well', team: "Simba's Team", count: 1 },
  { name: 'Akki Well', team: "Simba's Team", count: 1 }
];

// Reusable Section Header
const SectionHeader = ({ icon, title, iconColor }) => (
  <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
    <Avatar sx={{ width: 28, height: 28, bgcolor: iconColor }}>
      {icon}
    </Avatar>
    <Typography variant="h6">{title}</Typography>
  </Stack>
);

// Lost Opportunities Component
const Lost_Opportunities = () => (
  <Card sx={{ borderRadius: 2, boxShadow: 3, p: 2 }}>
    <SectionHeader
      icon={<TrendingDownIcon fontSize="small" />}
      title="Lost Opportunities"
      iconColor="error.light"
    />
    <Divider sx={{ mb: 1 }} />
    <CardContent sx={{ p: 0 }}>
      {lostOpportunities.map((item, index) => (
        <Box
          key={index}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          py={1.2}
          px={1}
          sx={{
            borderBottom: index !== lostOpportunities.length - 1 ? '1px solid #f0f0f0' : 'none'
          }}
        >
          <Box>
            <Typography fontWeight={600}>{item.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {item.team}
            </Typography>
          </Box>
          <Chip
            label={item.count}
            color="error"
            sx={{ borderRadius: '50%', width: 32, height: 32, fontWeight: 'bold' }}
          />
        </Box>
      ))}
    </CardContent>
  </Card>
);

export default Lost_Opportunities;
