import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { gridSpacing } from 'store/constant';

import Home from './Home';
import CheckInOut from '../Check-In&Out/CheckInOut';
import CompanyDetails from './CompanyDetails';

const Dashboard = () => {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);

    if (localStorage.getItem('LoginMessage') === 'true') {
      toast.success('Login Successful, Welcome!', {
        autoClose: 2000,
        theme: 'colored'
      });

      const timeoutId = setTimeout(() => {
        localStorage.setItem('LoginMessage', false);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, []);

  return (
    <Grid container spacing={gridSpacing} sx={{ p: 2 }}>
      <ToastContainer />

      {/* 🔹 Top Row: Home (Main) + CheckInOut (Side Card) */}
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          {/* 🏠 Main Home Section */}
          <Grid item lg={12} md={12} sm={12} xs={12}>
            <Home isLoading={isLoading} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          {/* 🕒 Check-In / Out Card */}
          <Grid
            item
            lg={3}
            md={3}
            sm={6}
            xs={12}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start'
            }}
          >
            <CheckInOut isLoading={isLoading} />
          </Grid>
        </Grid>
      </Grid>

      {/* 🔹 Company Details (Full Width) */}
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={12} md={12} sm={12} xs={12}>
            <CompanyDetails isLoading={isLoading} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
