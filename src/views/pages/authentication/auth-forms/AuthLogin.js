import Axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setUserRole } from 'store/actions';
import { encryptPassword } from 'views/utilities/passwordEnc';
// material-ui
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRef } from 'react';
import { useSelector } from 'react-redux';

// third party
import { Formik } from 'formik';
import * as Yup from 'yup';

// project imports
import useScriptRef from 'hooks/useScriptRef';
import AnimateButton from 'ui-component/extended/AnimateButton';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { setUser } from '../../../../redux/userSlice';

// ============================|| FIREBASE - LOGIN ||============================ //

const FirebaseLogin = ({ ...others }) => {
  const theme = useTheme();
  const scriptedRef = useScriptRef();
  const [checked, setChecked] = useState(false);
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const storedCredentials = localStorage.getItem('rememberedCredentials');
    if (storedCredentials) {
      const { email, password } = JSON.parse(storedCredentials);
      formikRef.current.setValues({ email, password });
      setChecked(true);
    }
  }, []);

  const user = useSelector((state) => state.user);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const formikRef = useRef(null);
  const navigate = useNavigate();
  const resetForm = () => {
    // Check if the formikRef is defined
    if (formikRef.current) {
      // Call the resetForm function using the ref
      formikRef.current.resetForm({
        values: {
          email: '',
          password: ''
        }
      });
    }
  };

  const loginAPICall = async (values) => {
    // Prepare the user registration data

    const userData = {
      password: encryptPassword(values.password),
      userName: values.email
    };
    try {
      const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status) {
        // Handle authentication failure, display an error message, etc.

        console.log('Test1', userData);
        dispatch(setUser({ orgId: response.data.paramObjectsMap.userVO.orgId }));

        localStorage.setItem('orgId', response.data.paramObjectsMap.userVO.orgId); // Replace with the actual token
        localStorage.setItem('userId', response.data.paramObjectsMap.userVO.usersId);
        localStorage.setItem('token', response.data.paramObjectsMap.userVO.token);
        localStorage.setItem('tokenId', response.data.paramObjectsMap.userVO.tokenId);
        localStorage.setItem('userName', response.data.paramObjectsMap.userVO.userName);
        localStorage.setItem('LoginMessage', true);
        const userRole = response.data.paramObjectsMap.userVO.roleVO;
        localStorage.setItem('ROLE', userRole);
        dispatch(setUserRole(userRole));
        resetForm();
        // window.location.href = "/login";

        navigate('/dashboard/default');
        if (checked) {
          localStorage.setItem('rememberedCredentials', JSON.stringify({ email: values.email, password: values.password }));
        } else {
          // Clear stored credentials if "Remember Me" is unchecked
          localStorage.removeItem('rememberedCredentials');
        }
      } else {
        // Successful registration, perform actions like storing tokens and redirecting
        toast.error(response.data.paramObjectsMap.errorMessage, {
          autoClose: 2000,
          theme: 'colored'
        });
        // setTimeout(() => {
        //   toast.success(response.data.paramObjectsMap.message, {
        //     autoClose: 2000,
        //     theme: 'colored'
        //   });
        // }, 2000);
      }
    } catch (error) {
      toast.error('Network Error', {
        autoClose: 2000,
        theme: 'colored'
      });
    }
  };

  return (
    <>
      <div>
        <ToastContainer />
      </div>
      <Grid container direction="column" justifyContent="center" spacing={2}>
        <Grid item xs={12}>
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex'
            }}
          >
            <Divider sx={{ flexGrow: 1 }} orientation="horizontal" />
          </Box>
        </Grid>
        <Grid item xs={12} container alignItems="center" justifyContent="center">
          {/* <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Sign in with Email address</Typography>
          </Box> */}
        </Grid>
      </Grid>

      <Formik
        innerRef={formikRef}
        initialValues={{
          email: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().max(255).required('UserId is required'),
          password: Yup.string().max(255).required('Password is required')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            if (scriptedRef.current) {
              setStatus({ success: true });
              setSubmitting(false);
              loginAPICall(values);
            }
          } catch (err) {
            console.error(err);
            if (scriptedRef.current) {
              setStatus({ success: false });
              setErrors({ submit: err.message });
              setSubmitting(false);
            }
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit} {...others}>
            <FormControl fullWidth error={Boolean(touched.email && errors.email)} sx={{ ...theme.typography.customInput }}>
              <InputLabel htmlFor="outlined-adornment-email-login">Email Address / Username</InputLabel>
              <OutlinedInput
                id="outlined-adornment-email-login"
                type="email"
                value={values.email}
                name="email"
                onBlur={handleBlur}
                onChange={handleChange}
                label="Email Address / Username"
                inputProps={{}}
              />
              {touched.email && errors.email && (
                <FormHelperText error id="standard-weight-helper-text-email-login">
                  {errors.email}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth error={Boolean(touched.password && errors.password)} sx={{ ...theme.typography.customInput }}>
              <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password-login"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                name="password"
                onBlur={handleBlur}
                onChange={handleChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      size="large"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
                inputProps={{}}
              />
              {touched.password && errors.password && (
                <FormHelperText error id="standard-weight-helper-text-password-login">
                  {errors.password}
                </FormHelperText>
              )}
            </FormControl>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <FormControlLabel
                control={
                  <Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} name="checked" color="primary" />
                }
                label="Remember me"
              />
              <Typography variant="subtitle1" color="secondary" sx={{ textDecoration: 'none', cursor: 'pointer' }}>
                Forgot Password?
              </Typography>
            </Stack>
            {errors.submit && (
              <Box sx={{ mt: 3 }}>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Box>
            )}

            <Box sx={{ mt: 2 }}>
              <AnimateButton>
                <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="secondary">
                  Sign in
                </Button>
              </AnimateButton>
            </Box>
          </form>
        )}
      </Formik>
    </>
  );
};

export default FirebaseLogin;
