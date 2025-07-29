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
          {/* 1 */}
          <Grid item lg={3} md={6} sm={6} xs={12}>
            <EarningCard isLoading={isLoading} />
          </Grid>
          {/* 2 */}
          <Grid item lg={3} md={6} sm={6} xs={12}>
            <TotalOrderLineChartCard isLoading={isLoading} />
          </Grid>
          {/* 3 */}
          <Grid item lg={3} md={6} sm={6} xs={12}>
            <EarningCard isLoading={isLoading} />
          </Grid>
          {/* 4 */}
          <Grid item lg={3} md={6} sm={6} xs={12}>
            <TotalOrderLineChartCard isLoading={isLoading} />
          </Grid>
        </Grid>
      </Grid>
      {/* 2 */}
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          {/* 1 */}
          <Grid item lg={3} md={6} sm={6} xs={12}>
            <TotalIncomeDarkCard isLoading={isLoading} />
          </Grid>
          {/* 2 */}
          <Grid item lg={3} md={6} sm={6} xs={12}>
            <TotalIncomeLightCard isLoading={isLoading} />
          </Grid>
          {/* 3 */}
          <Grid item lg={3} md={6} sm={6} xs={12}>
            <TotalIncomeDarkCard isLoading={isLoading} />
          </Grid>
          {/* 4 */}
          <Grid item lg={3} md={6} sm={6} xs={12}>
            <TotalIncomeLightCard isLoading={isLoading} />
          </Grid>
          {/* 3 */}
        </Grid>
      </Grid>
      {/* 3 */}
      {/* <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          
          <Grid item lg={3} md={6} sm={6} xs={12}>
            <BajajAreaChartCard isLoading={isLoading} />
          </Grid>
          
          <Grid item lg={3} md={6} sm={6} xs={12}>
            <PopularCard isLoading={isLoading} />
          </Grid>
          
          <Grid item lg={3} md={6} sm={6} xs={12}>
            <TotalGrowthBarChart isLoading={isLoading} />
          </Grid>
          
          <Grid item lg={3} md={6} sm={6} xs={12}>
            <gridSpacing isLoading={isLoading} />
          </Grid>
          
        </Grid>
      </Grid> */}
    </Grid>
  );
};

export default Dashboard;
