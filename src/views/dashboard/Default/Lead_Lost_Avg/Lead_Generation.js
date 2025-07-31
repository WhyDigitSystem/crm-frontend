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
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'; // Updated icon
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// Sample Data
const leadData = [
  { name: 'Manager User', team: 'Unassigned', leads: 1 },
  { name: 'Simba Well', team: 'Unassigned', leads: 3 },
  { name: 'Sales User', team: "Manager's Team", leads: 1 },
  { name: 'Marshall Well', team: "Simba's Team", leads: 1 },
  { name: 'Akki Well', team: "Simba's Team", leads: 1 }
];

const lostOpportunities = [
  { name: 'Manager User', team: 'Unassigned' },
  { name: 'Simba Well', team: 'Unassigned' },
  { name: 'Sales User', team: "Manager's Team" },
  { name: 'Marshall Well', team: "Simba's Team" },
  { name: 'Akki Well', team: "Simba's Team" }
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

// Lead Generation Component
export const Lead_Generation = () => (
  <Card sx={{ borderRadius: 2, boxShadow: 3, p: 2 }}>
    <SectionHeader icon={<PersonAddAltIcon fontSize="small" />} title="Lead Generation" iconColor="primary.light" />
    <Divider sx={{ mb: 1 }} />
    <CardContent sx={{ p: 0 }}>
      {leadData.map((item, index) => (
        <Box
          key={index}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          py={1.2}
          px={1}
          sx={{
            borderBottom: index !== leadData.length - 1 ? '1px solid #f0f0f0' : 'none'
          }}
        >
          <Box>
            <Typography fontWeight={600}>{item.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {item.team}
            </Typography>
          </Box>
          <Chip
            label={item.leads}
            color="primary"
            sx={{ borderRadius: '50%', width: 32, height: 32, fontWeight: 'bold' }}
          />
        </Box>
      ))}
    </CardContent>
  </Card>
);

export default Lead_Generation;
