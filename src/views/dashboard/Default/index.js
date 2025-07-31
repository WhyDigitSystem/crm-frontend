import { useEffect, useState } from 'react';

// material-ui
import { Grid } from '@mui/material';

// project imports
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { gridSpacing } from 'store/constant';
import EarningCard from './EarningCard';
import PopularCard from './PopularCard';
import TotalGrowthBarChart from './TotalGrowthBarChart';
import TotalIncomeDarkCard from './TotalIncomeDarkCard';
import TotalIncomeLightCard from './TotalIncomeLightCard';
import TotalOrderLineChartCard from './TotalOrderLineChartCard';
import BajajAreaChartCard from './BajajAreaChartCard';

import Home from './Home';
// CurrentMonthRevenue
import CurrentMonthRevenue from './CurrentMonth/CurrentMonthRevenue';
import CurrentMonthActiveLeads from './CurrentMonth/CurrentMonthActiveLeads';
import CurrentMonthWinRate from './CurrentMonth/CurrentMonthWinRate';
import CurrentMonthPipelineValue from './CurrentMonth/CurrentMonthPipelineValue';

// SalesTeamPerformance
import SalesTeamPerformance from './SalesTeamPerformance/SalesTeamPerformance';
import AllSalesWinRateRatio from './SalesTeamPerformance/All_Sales_Win_Rate_Ratio'
import AllSalesPerformance from './SalesTeamPerformance/All_Sales_Performance';

// Lead_Lost_Avg
import LeadGeneration from './Lead_Lost_Avg/Lead_Generation';
import LostOpportunities from './Lead_Lost_Avg/Lost_Opportunities';
import AvgConversionRate from './Lead_Lost_Avg/Avg_Conversion_Rate';

// Task 
import RecentActivities from './Task/RecentActivities';
import UpcomingTasks from './Task/UpcomingTasks'

import CompanyDetails from './CompanyDetails'

// ==============================|| DEFAULT DASHBOARD ||============================== //

const Dashboard = () => {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    if (localStorage.getItem('LoginMessage') === 'true') {
      toast.success('Login Successful, Welcome!', {
        autoClose: 2000,
        theme: 'colored'
      });

      // Set loginMessage to false after 2 seconds
      const timeoutId = setTimeout(() => {
        localStorage.setItem('LoginMessage', false);
      }, 2000);

      // setTimeout(() => {
      //   window.location.reload();
      // }, 2000);

      // Clear the timeout on component unmount to prevent memory leaks
      return () => clearTimeout(timeoutId);
    }
  }, []);

  return (
    <Grid container spacing={gridSpacing}>
      <div>
        <ToastContainer />
      </div>
      {/* 1 */}
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={12} md={6} sm={6} xs={12}>
            <Home isLoading={isLoading} />
          </Grid>
          {/* 1 */}
          <Grid item lg={3} md={6} sm={6} xs={12}>
            <CurrentMonthRevenue isLoading={isLoading} />
          </Grid>
          {/* 2 */}
          <Grid item lg={3} md={6} sm={6} xs={12}>
            <CurrentMonthActiveLeads isLoading={isLoading} />
          </Grid>
          {/* 3 */}
          <Grid item lg={3} md={6} sm={6} xs={12}>
            <CurrentMonthWinRate isLoading={isLoading} />
          </Grid>
          {/* 4 */}
          <Grid item lg={3} md={6} sm={6} xs={12}>
            <CurrentMonthPipelineValue isLoading={isLoading} />
          </Grid>
        </Grid>
      </Grid>

      {/* 1 */}
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={12} md={6} sm={6} xs={12}>
            <SalesTeamPerformance isLoading={isLoading} />
          </Grid>
          {/* 1 */}
          <Grid item lg={6} md={6} sm={6} xs={12}>
            <AllSalesWinRateRatio isLoading={isLoading} />
          </Grid>
          {/* 2 */}
          <Grid item lg={6} md={6} sm={6} xs={12}>
            <AllSalesPerformance isLoading={isLoading} />
          </Grid>
        </Grid>
      </Grid>

      {/* 1 */}
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <LeadGeneration isLoading={isLoading} />
          </Grid>
          {/* 1 */}
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <LostOpportunities isLoading={isLoading} />
          </Grid>
          {/* 2 */}
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <AvgConversionRate isLoading={isLoading} />
          </Grid>
        </Grid>
      </Grid>

      {/* 1 */}
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={6} md={6} sm={6} xs={12}>
            <RecentActivities isLoading={isLoading} />
          </Grid>
          {/* 1 */}
          <Grid item lg={6} md={6} sm={6} xs={12}>
            <UpcomingTasks isLoading={isLoading} />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={12} md={6} sm={6} xs={12}>
            <CompanyDetails isLoading={isLoading} />
          </Grid>
        </Grid>
      </Grid>

    </Grid>
  );
};

export default Dashboard;
