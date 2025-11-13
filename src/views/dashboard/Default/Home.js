import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import {
  Avatar,
  Box,
  Button,
  Grid,
  Menu,
  MenuItem,
  Typography,
  Paper,
  Divider,
  Tooltip
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonEarningCard from 'ui-component/cards/Skeleton/EarningCard';

// assets
import ArchiveTwoToneIcon from '@mui/icons-material/ArchiveOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import FileCopyTwoToneIcon from '@mui/icons-material/FileCopyOutlined';
import GetAppTwoToneIcon from '@mui/icons-material/GetAppOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PictureAsPdfTwoToneIcon from '@mui/icons-material/PictureAsPdfOutlined';
import SyncIcon from '@mui/icons-material/Sync';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DownloadIcon from '@mui/icons-material/CloudDownloadOutlined';
import ReportIcon from '@mui/icons-material/AssessmentOutlined';
import EarningIcon from 'assets/images/icons/earning.svg';

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  borderRadius: '12px',
  boxShadow: theme.shadows[3],
  backgroundColor: theme.palette.background.paper
}));

const Home = ({ isLoading }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ px: 2, py: 1 }}>
      {/* Dashboard Header */}
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h5" fontWeight={600} color="text.primary">
            Dashboard
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            startIcon={<SyncIcon />}
            sx={{
              textTransform: 'none',
              color: theme.palette.primary.main,
              borderColor: theme.palette.primary.main
            }}
          >
            Sync Statuses
          </Button>
        </Grid>
      </Grid>

      {/* Welcome Banner */}
      {/* <Box
        sx={{
          mt: 3,
          p: 3,
          borderRadius: 2,
          background: theme.palette.primary.light,
          color: theme.palette.primary.contrastText
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar sx={{ width: 56, height: 56 }}>D</Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h6">Welcome back, Dinesh 👋</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Here’s a quick summary of your performance today.
            </Typography>
          </Grid>
        </Grid>
      </Box> */}

      {/* Quick Stats */}
      {/* <Grid container spacing={2} mt={2}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard>
            <Avatar sx={{ bgcolor: theme.palette.success.light }}>
              <TrendingUpIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2">Total Earnings</Typography>
              <Typography variant="h6">$8,750</Typography>
            </Box>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard>
            <Avatar sx={{ bgcolor: theme.palette.warning.light }}>
              <DownloadIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2">Downloads</Typography>
              <Typography variant="h6">1,240</Typography>
            </Box>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard>
            <Avatar sx={{ bgcolor: theme.palette.info.light }}>
              <ReportIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2">Reports</Typography>
              <Typography variant="h6">18 Generated</Typography>
            </Box>
          </StatCard>
        </Grid>
      </Grid> */}
    </Box>
  );
};

Home.propTypes = {
  isLoading: PropTypes.bool
};

export default Home;
