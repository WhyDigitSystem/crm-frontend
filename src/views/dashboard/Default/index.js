// import { useEffect, useState } from 'react';

// // material-ui
// import { Grid } from '@mui/material';

// // project imports
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { gridSpacing } from 'store/constant';
// import EarningCard from './EarningCard';
// import PopularCard from './PopularCard';
// import TotalGrowthBarChart from './TotalGrowthBarChart';
// import TotalIncomeDarkCard from './TotalIncomeDarkCard';
// import TotalIncomeLightCard from './TotalIncomeLightCard';
// import TotalOrderLineChartCard from './TotalOrderLineChartCard';
// import BajajAreaChartCard from './BajajAreaChartCard';

// import Home from './Home';
// // CurrentMonthRevenue
// import CurrentMonthRevenue from './CurrentMonth/CurrentMonthRevenue';
// import CurrentMonthActiveLeads from './CurrentMonth/CurrentMonthActiveLeads';
// import CurrentMonthWinRate from './CurrentMonth/CurrentMonthWinRate';
// import CurrentMonthPipelineValue from './CurrentMonth/CurrentMonthPipelineValue';

// // SalesTeamPerformance
// import SalesTeamPerformance from './SalesTeamPerformance/SalesTeamPerformance';
// import AllSalesWinRateRatio from './SalesTeamPerformance/All_Sales_Win_Rate_Ratio'
// import AllSalesPerformance from './SalesTeamPerformance/All_Sales_Performance';

// // Lead_Lost_Avg
// import LeadGeneration from './Lead_Lost_Avg/Lead_Generation';
// import LostOpportunities from './Lead_Lost_Avg/Lost_Opportunities';
// import AvgConversionRate from './Lead_Lost_Avg/Avg_Conversion_Rate';

// // Task 
// import RecentActivities from './Task/RecentActivities';
// import UpcomingTasks from './Task/UpcomingTasks'

// import CompanyDetails from './CompanyDetails'

// // ==============================|| DEFAULT DASH ||============================== //

// const Dashboard = () => {
//   const [isLoading, setLoading] = useState(true);

//   useEffect(() => {
//     setLoading(false);
//     if (localStorage.getItem('LoginMessage') === 'true') {
//       toast.success('Login Successful, Welcome!', {
//         autoClose: 2000,
//         theme: 'colored'
//       });

//       // Set loginMessage to false after 2 seconds
//       const timeoutId = setTimeout(() => {
//         localStorage.setItem('LoginMessage', false);
//       }, 2000);

//       // setTimeout(() => {
//       //   window.location.reload();
//       // }, 2000);

//       // Clear the timeout on component unmount to prevent memory leaks
//       return () => clearTimeout(timeoutId);
//     }
//   }, []);

//   return (
//     <Grid container spacing={gridSpacing}>
//       <div>
//         <ToastContainer />
//       </div>
//       {/* 1 */}
//       <Grid item xs={12}>
//         <Grid container spacing={gridSpacing}>
//           <Grid item lg={12} md={6} sm={6} xs={12}>
//             <Home isLoading={isLoading} />
//           </Grid>
//           {/* 1 */}
//           <Grid item lg={3} md={6} sm={6} xs={12}>
//             <CurrentMonthRevenue isLoading={isLoading} />
//           </Grid>
//           {/* 2 */}
//           <Grid item lg={3} md={6} sm={6} xs={12}>
//             <CurrentMonthActiveLeads isLoading={isLoading} />
//           </Grid>
//           {/* 3 */}
//           <Grid item lg={3} md={6} sm={6} xs={12}>
//             <CurrentMonthWinRate isLoading={isLoading} />
//           </Grid>
//           {/* 4 */}
//           <Grid item lg={3} md={6} sm={6} xs={12}>
//             <CurrentMonthPipelineValue isLoading={isLoading} />
//           </Grid>
//         </Grid>
//       </Grid>

//       {/* 1 */}
//       <Grid item xs={12}>
//         <Grid container spacing={gridSpacing}>
//           <Grid item lg={12} md={6} sm={6} xs={12}>
//             <SalesTeamPerformance isLoading={isLoading} />
//           </Grid>
//           {/* 1 */}
//           <Grid item lg={6} md={6} sm={6} xs={12}>
//             <AllSalesWinRateRatio isLoading={isLoading} />
//           </Grid>
//           {/* 2 */}
//           <Grid item lg={6} md={6} sm={6} xs={12}>
//             <AllSalesPerformance isLoading={isLoading} />
//           </Grid>
//         </Grid>
//       </Grid>

//       {/* 1 */}
//       <Grid item xs={12}>
//         <Grid container spacing={gridSpacing}>
//           <Grid item lg={4} md={6} sm={6} xs={12}>
//             <LeadGeneration isLoading={isLoading} />
//           </Grid>
//           {/* 1 */}
//           <Grid item lg={4} md={6} sm={6} xs={12}>
//             <LostOpportunities isLoading={isLoading} />
//           </Grid>
//           {/* 2 */}
//           <Grid item lg={4} md={6} sm={6} xs={12}>
//             <AvgConversionRate isLoading={isLoading} />
//           </Grid>
//         </Grid>
//       </Grid>

//       {/* 1 */}
//       {/* <Grid item xs={12}>
//         <Grid container spacing={gridSpacing}>
//           <Grid item lg={6} md={6} sm={6} xs={12}>
//             <RecentActivities isLoading={isLoading} />
//           </Grid>
//           <Grid item lg={6} md={6} sm={6} xs={12}>
//             <UpcomingTasks isLoading={isLoading} />
//           </Grid>
//         </Grid>
//       </Grid> */}

//       <Grid item xs={12}>
//         <Grid container spacing={gridSpacing}>
//           <Grid item lg={12} md={6} sm={6} xs={12}>
//             <CompanyDetails isLoading={isLoading} />
//           </Grid>
//         </Grid>
//       </Grid>

//     </Grid>
//   );
// };

// export default Dashboard;
import {
  Stack,
  Chip,
  IconButton,
  Divider,
  Avatar,
  Button,
  Grid,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import KPIBox from 'views/basicMaster/KPIBox';
import SectionCard from './SectionCard';
import ScreenGate from './ScreenGate';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import apiCalls from 'apicall';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [branch] = useState(localStorage.getItem('branch'));
  const [branchCode] = useState(localStorage.getItem('branchcode'));
  const [finYear] = useState(localStorage.getItem('finYear'));
  const [employeeCode] = useState(localStorage.getItem('employeeCode'));
  const [openTaskDialog, setOpenTaskDialog] = useState(false);

  const [todaystask, setTodaysTask] = useState([{
    venue: '',
    clientName: '',
    contactName: '',
    startTime: '',
    type: '',
    direction: '',
  }])
  const [summaryCard, setSummaryCard] = useState({
    totalLeads: 0,
    totalOpportunites: 0,
    totalSalesorder: 0,
    totalCustomers: 0,
    totalQuotations: 0,
    percentage: 0,
  })
  useEffect(() => {
    getKPIDetails();
    getTodaysTask();
  }, [])
  const getKPIDetails = async () => {
    try {
      const response = await apiCalls('get', `/userdashboard/getDashboardDetailsBasedUserName?branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}&userName=${employeeCode}`);
      if (response.status === true) {
        const quality = response.paramObjectsMap.clientInformation[0];
        setSummaryCard({
          totalLeads: quality.totalLeads || 0,
          totalOpportunites: quality.totalOpportunites || 0,
          totalSalesorder: quality.totalSalesorder || 0,
          totalCustomers: quality.totalCustomers || 0,
          totalQuotations: quality.totalQuotations || 0,
          percentage: quality.percentage || 0,
        });
      } else {
        setSummaryCard({
          totalLeads: 0,
          totalOpportunites: 0,
          totalSalesorder: 0,
          totalCustomers: 0,
          totalQuotations: 0,
          percentage: 0,
        });
      }

      // setIsLoading(false);
    } catch (error) {
      console.error('Error fetching leads:', error);
      // setIsLoading(false);
    }
  };
  const getTodaysTask = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/userdashboard/getFollowUpDetails?branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}&userName=${employeeCode}`
      );

      if (
        response?.status === true &&
        Array.isArray(response?.paramObjectsMap?.clientInformation)
      ) {
        setTodaysTask(response.paramObjectsMap.clientInformation);
      } else {
        setTodaysTask([]);
      }
    } catch (error) {
      console.error('Error fetching today tasks:', error);
      setTodaysTask([]);
    }
  };
  const getTaskIcon = (type) => {
    switch (type) {
      case 'Call':
        return <CallOutlinedIcon color="primary" />;
      case 'Meeting':
        return <EventOutlinedIcon color="success" />;
      default:
        return <TaskOutlinedIcon color="action" />;
    }
  };

  return (
    <Box p={3}>
      <Grid container spacing={2}>

        <ScreenGate screen="DASH">
          <Grid item xs={12} sm={6} md={3}>
            <KPIBox
              summaryData={{
                label: 'Leads',
                count: summaryCard.totalLeads,
                color: '#2563eb',
                icon: <GroupsOutlinedIcon fontSize="large" />,
              }}
            />
          </Grid>
        </ScreenGate>

        <ScreenGate screen="DASH">
          <Grid item xs={12} sm={6} md={3}>
            <KPIBox
              summaryData={{
                label: 'Opportunities',
                count: summaryCard.totalOpportunites,
                color: '#0ea5e9',
                icon: <TrendingUpOutlinedIcon fontSize="large" />,
              }}
            />
          </Grid>
        </ScreenGate>

        <ScreenGate screen="DASH">
          <Grid item xs={12} sm={6} md={3}>
            <KPIBox
              summaryData={{
                label: 'Sales Orders',
                count: summaryCard.totalSalesorder,
                color: '#16a34a',
                icon: <ShoppingCartOutlinedIcon fontSize="large" />,
              }}
            />
          </Grid>
        </ScreenGate>

        <ScreenGate screen="DASH">
          <Grid item xs={12} sm={6} md={3}>
            <KPIBox
              summaryData={{
                label: 'Customers',
                count: summaryCard.totalCustomers,
                color: '#6366f1',
                icon: <PersonOutlinedIcon fontSize="large" />,
              }}
            />
          </Grid>
        </ScreenGate>

        {/* <ScreenGate screen="DASH">
          <Grid item xs={12} sm={6} md={3}>
            <KPIBox
              summaryData={{
                label: 'Pend Apprv',
                count: 12,
                color: '#f59e0b',
                icon: <FactCheckOutlinedIcon fontSize="large" />,
              }}
            />
          </Grid>
        </ScreenGate> */}

        {/* <ScreenGate screen="DASH">
          <Grid item xs={12} sm={6} md={2}>
            <KPIBox
              summaryData={{
                label: 'Inventory Alerts',
                count: 6,
                color: '#dc2626',
                icon: <WarningAmberOutlinedIcon fontSize="large" />,
              }}
            />
          </Grid>
        </ScreenGate> */}
      </Grid>

      {/* SALES & TODAY'S TASKS */}
      <Grid container spacing={2} mt={1}>
        <ScreenGate screen="DASH">
          <Grid item xs={12} md={8}>
            <SectionCard title="Lead to Order Conversion">

              <Stack spacing={3}>
                {/* Pipeline Flow with Numbers */}
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">

                  <Stack alignItems="center">
                    <Typography variant="h6">{`${summaryCard.totalLeads}`}</Typography>
                    <Chip label="Leads" color="primary" />
                  </Stack>
                  <ArrowForwardIosOutlinedIcon fontSize="small" />

                  <Stack alignItems="center">
                    <Typography variant="h6">{`${summaryCard.totalOpportunites}`}</Typography>
                    <Chip label="Opportunities" color="info" />
                  </Stack>

                  <ArrowForwardIosOutlinedIcon fontSize="small" />

                  <Stack alignItems="center">
                    <Typography variant="h6"><Typography variant="h6">{`${summaryCard.totalQuotations}`}</Typography></Typography>
                    <Chip label="Quotations" color="warning" />
                  </Stack>

                  <ArrowForwardIosOutlinedIcon fontSize="small" />

                  <Stack alignItems="center">
                    <Typography variant="h6"><Typography variant="h6">{`${summaryCard.totalSalesorder}`}</Typography></Typography>
                    <Chip label="Sales Orders" color="success" />
                  </Stack>

                </Stack>

                {/* Conversion Summary */}
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{
                    bgcolor: '#f1f5f9',
                    p: 2,
                    borderRadius: 2
                  }}
                >
                  <InfoOutlinedIcon color="primary" />
                  <Typography fontWeight={600}>
                    Conversion Rate:
                  </Typography>
                  <Typography fontWeight={700} color="success.main">
                    <Typography variant="h6">{`${summaryCard.percentage}%`}</Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    (Leads to Sales Orders)
                  </Typography>
                </Stack>

              </Stack>
            </SectionCard>
          </Grid>
        </ScreenGate>
        {/* TODAY'S TASKS */}
        <ScreenGate screen="DASH">
          <Grid item xs={12} md={4}>
            <SectionCard
              title={
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={600}>
                    Today’s Focus
                  </Typography>

                  <Chip
                    label={todaystask.length}
                    size="small"
                    color="primary"
                  />
                </Stack>
              }
            >
              <Stack spacing={2}>
                {todaystask.length > 0 ? (
                  todaystask.slice(0, 1).map((task, index) => (
                    <Stack key={index} spacing={1}>

                      <Stack direction="row" spacing={2} alignItems="center">

                        <Avatar sx={{ bgcolor: '#e3f2fd' }}>
                          {getTaskIcon(task.type)}
                        </Avatar>

                        <Stack flex={1}>
                          <Typography fontWeight={600}>
                            Follow up with {task.clientName}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {task.startTime} · {task.type}
                            {task.direction ? ` · ${task.direction}` : ''}
                          </Typography>
                        </Stack>

                        <Chip
                          label="Pending"
                          color="warning"
                          size="small"
                        />

                      </Stack>

                      {index < todaystask.length - 1 && <Divider />}
                    </Stack>
                  ))
                ) : (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    align="center"
                  >
                    No follow-ups scheduled for today 🎉
                  </Typography>
                )}

                {/* Footer */}
                <Button
                  variant="text"
                  size="small"
                  sx={{ alignSelf: 'flex-end', mt: 1 }}
                  onClick={() => setOpenTaskDialog(true)}
                >
                  View All Tasks
                </Button>

              </Stack>
            </SectionCard>
          </Grid>
        </ScreenGate>
        <Dialog
          open={openTaskDialog}
          onClose={() => setOpenTaskDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Today’s Focus
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2}>

              {todaystask.map((task, index) => (
                <Stack key={index} spacing={1}>

                  <Stack direction="row" spacing={2} alignItems="center">

                    <Avatar sx={{ bgcolor: '#e3f2fd' }}>
                      {getTaskIcon(task.type)}
                    </Avatar>

                    <Stack flex={1}>
                      <Typography fontWeight={600}>
                        Follow up with {task.clientName}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {task.startTime} · {task.type}
                        {task.direction ? ` · ${task.direction}` : ''}
                      </Typography>
                    </Stack>

                    <Chip label="Pending" color="warning" size="small" />
                  </Stack>

                  {index < todaystask.length - 1 && <Divider />}
                </Stack>
              ))}

            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenTaskDialog(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
      {/* ================= SALES PERFORMANCE SUMMARY ================= */}
      <Grid container spacing={2} mt={1}>

        {/* TARGET vs ACHIEVEMENT */}
        <Grid item xs={12} md={4}>
          <SectionCard title="Target vs Achievement">

            <Stack spacing={2}>

              <Typography variant="h4" color="success.main">
                72%
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Target Achieved This Month
              </Typography>

              <Divider />

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption">Target</Typography>
                <Typography variant="caption" fontWeight={600}>
                  ₹10,00,000
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption">Achieved</Typography>
                <Typography variant="caption" fontWeight={600}>
                  ₹7,20,000
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption">Remaining</Typography>
                <Typography variant="caption" color="warning.main">
                  ₹2,80,000
                </Typography>
              </Stack>

            </Stack>

          </SectionCard>
        </Grid>

        {/* REWARDS & PERFORMANCE */}
        <Grid item xs={12} md={4}>
          <SectionCard title="Rewards & Performance">

            <Stack spacing={2}>

              <Stack>
                <Typography variant="caption" color="text.secondary">
                  🏆 Top Performer
                </Typography>
                <Typography fontWeight={600}>
                  Arun (Chennai)
                </Typography>
                <Typography variant="caption" color="success.main">
                  112% of target
                </Typography>
              </Stack>

              <Divider />

              <Stack>
                <Typography variant="caption" color="text.secondary">
                  ⚠️ Needs Attention
                </Typography>
                <Typography fontWeight={600}>
                  Priya (Bangalore)
                </Typography>
                <Typography variant="caption" color="error.main">
                  68% of target
                </Typography>
              </Stack>

              <Divider />

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption">Company Average</Typography>
                <Typography variant="caption" fontWeight={600}>
                  75%
                </Typography>
              </Stack>

            </Stack>

          </SectionCard>
        </Grid>

        {/* LOST / DROP SUMMARY */}
        <Grid item xs={12} md={4}>
          <SectionCard title="Where We Lose Deals">

            <Stack spacing={2}>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">
                  Price Too High
                </Typography>
                <Typography fontWeight={600}>
                  12
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">
                  No Response from Client
                </Typography>
                <Typography fontWeight={600}>
                  8
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">
                  Competitor Won
                </Typography>
                <Typography fontWeight={600}>
                  6
                </Typography>
              </Stack>

              <Divider />

              <Typography variant="caption" color="text.secondary">
                Based on lost opportunities this month
              </Typography>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
      <Grid container spacing={2} mt={1}>

        <ScreenGate screen="FSL">
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>

              {/* ================= Field Staff Summary ================= */}
              <Grid item xs={12}>
                <SectionCard title="Field Staff Summary">

                  <Stack spacing={3}>

                    <Stack direction="row" spacing={2} justifyContent="space-between">

                      <Stack alignItems="center">
                        <GroupsOutlinedIcon color="primary" />
                        <Typography variant="h6">18</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Active Today
                        </Typography>
                      </Stack>

                      <Stack alignItems="center">
                        <CheckCircleOutlineOutlinedIcon color="success" />
                        <Typography variant="h6">42</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Visits Completed
                        </Typography>
                      </Stack>

                      <Stack alignItems="center">
                        <PauseCircleOutlineOutlinedIcon color="warning" />
                        <Typography variant="h6" color="warning.main">
                          3
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Idle Staff
                        </Typography>
                      </Stack>

                    </Stack>

                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ alignSelf: 'flex-end' }}
                    >
                      View Staff Details
                    </Button>

                  </Stack>
                </SectionCard>
              </Grid>

              {/* ================= Announcements / Alerts ================= */}
              <Grid item xs={12}>
                <SectionCard title="Announcements & Alerts">

                  <Stack spacing={1}>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <CampaignOutlinedIcon color="primary" fontSize="small" />
                      <Typography variant="body2">
                        New sales incentive policy effective from Oct 1
                      </Typography>
                    </Stack>
                    <Button
                      variant="text"
                      size="small"
                      sx={{ alignSelf: 'flex-end' }}
                    >
                      View All Announcements
                    </Button>

                  </Stack>
                </SectionCard>
              </Grid>

            </Grid>
          </Grid>
        </ScreenGate>
      </Grid>

    </Box>
  );
}
