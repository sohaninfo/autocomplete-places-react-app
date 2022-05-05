import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import {
  Box,
  Button,
  FormHelperText,
  Grid,
  TextField,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import GoogleAutoCompelete from './Google/GoogleAutoCompelete';
import GetPostalCode from './Google/GetPostalCode';


const AutoFillForm = ({
  className,
  setData,
  data,
  projectId,
  ...rest
}) => {
  const [addresses, setAddresses] = useState([]);
  
  const handleChangeAddress = async (searchValue) => {
    if(!searchValue.target.value){
      return null;
    }
    const results = await GoogleAutoCompelete(searchValue.target.value);
    if (results) {
      setAddresses(results);
    }
  }

  const changeAddress = async (value, setFieldValue) => {
        let result = null;
        for(let x = 0; x < addresses.length; x++){
          if(value === addresses[x].description){
            result = await GetPostalCode(addresses[x].place_id);
            // Get Zip code
          }
        }
        if(!result){ return ; }
        setFieldValue('companyAddress', value);
        let postcode = null;
        for(let i = 0; i < result.address_components.length; i++){
          if(result.address_components[i].types[0] === 'postal_code'){
              postcode = result.address_components[i].long_name;
          }
        }
        setFieldValue('zipCode', postcode);
        // Get city
        let city = null;
        for(let i = 0; i < result.address_components.length; i++){
          if(result.address_components[i].types[0] === 'locality'){
              city = result.address_components[i].long_name;
          }
        }
        if(!city){
          for(let i = 0; i < result.address_components.length; i++){
            if(result.address_components[i].types[0] === 'administrative_area_level_2'){
                city = result.address_components[i].long_name;
            }
          }
        }
        setFieldValue('city', city);

        // Get State
        let state = null;
        for(let i = 0; i < result.address_components.length; i++){
          if(result.address_components[i].types[0] === 'administrative_area_level_1'){
            state = result.address_components[i].long_name;
          }
        }
        if(!state){
          for(let i = 0; i < result.address_components.length; i++){
            if(result.address_components[i].types[0] === 'administrative_area_level_2'){
              state = result.address_components[i].long_name;
            }
          }
        }
        setFieldValue('stateOfAddress', state);
  }

	//We can use this function to disable the browser auto complete from the fields because it looks really annoying
  useEffect(() => {
    window.document.querySelector('input[name="companyAddress"]').setAttribute('autocomplete', 'disable');
    window.document.querySelector('input[name="companyAddress"]').setAttribute('aria-autocomplete', 'off');
    window.document.querySelector('input[name="zipCode"]').setAttribute('autocomplete', 'disable');
    window.document.querySelector('input[name="zipCode"]').setAttribute('aria-autocomplete', 'off');
    window.document.querySelector('input[name="city"]').setAttribute('autocomplete', 'disable');
    window.document.querySelector('input[name="city"]').setAttribute('aria-autocomplete', 'off');
    window.document.querySelector('input[name="stateOfAddress"]').setAttribute('autocomplete', 'disable');
    window.document.querySelector('input[name="stateOfAddress"]').setAttribute('aria-autocomplete', 'off');
  }, []);
  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        companyAddress: '',
        zipCode: '',
        city: '',
        stateOfAddress: '',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        companyAddress: Yup.string().max(255).required('Company address is required'),
        zipCode: Yup.string().max(255),
        city: Yup.string().max(255),
        stateOfAddress: Yup.string().max(255),
      })}
      onSubmit={async (values, {
        setErrors,
        setStatus,
        setSubmitting,
      }) => {
        try {
          console.log(values);
        } catch (err) {
          console.error(err);
          setStatus({ success: false });
          setErrors({ submit: err.message });
          setSubmitting(false);
        }
      }}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        touched,
        values,
        setFieldValue
      }) => (
        <form
          onSubmit={handleSubmit}
          {...rest}
        >
          <Grid container> 
            <Grid item md={6} xs={12}> 
              <Box mt={3} px={6}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={addresses.map((option) => option.description)}
                      // closeIcon= { () => { return; } }
                      onInputChange={(event, value) => { changeAddress(value, setFieldValue); }}
                      autoComplete={false}
                      renderInput={(params) => (
                          <TextField {...params} label="Company Address" name="companyAddress" value={values.companyAddress} onChange={(value) => { handleChangeAddress(value); }} variant="outlined" />
                      )} 
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      error={Boolean(touched.zipCode && errors.zipCode)}
                      fullWidth
                      helperText={touched.zipCode && errors.zipCode}
                      label="Zip Code"
                      name="zipCode"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.zipCode}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      error={Boolean(touched.city && errors.city)}
                      fullWidth
                      helperText={touched.city && errors.city}
                      label="City"
                      name="city"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.city}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      error={Boolean(touched.stateOfAddress && errors.stateOfAddress)}
                      fullWidth
                      helperText={touched.stateOfAddress && errors.stateOfAddress}
                      label="State (Administrative Area)"
                      name="stateOfAddress"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.stateOfAddress}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
                {Boolean(touched.tags && errors.tags) && (
                  <Box mt={2}>
                    <FormHelperText error>
                      {errors.tags}
                    </FormHelperText>
                  </Box>
                )}
                {Boolean(touched.startDate && errors.startDate) && (
                  <Box mt={2}>
                    <FormHelperText error>
                      {errors.startDate}
                    </FormHelperText>
                  </Box>
                )}
                {Boolean(touched.endDate && errors.endDate) && (
                  <Box mt={2}>
                    <FormHelperText error>
                      {errors.endDate}
                    </FormHelperText>
                  </Box>
                )}
              </Box>
              <Box
                mt={12}
                display="flex"
              >
                <Box flexGrow={1} />
                <Button
                  color="secondary"
                  disabled={isSubmitting}
                  type="submit"
                  variant="contained"
                  size="large"
                >
                  Submit
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      )}
    </Formik>
  );
};

export default AutoFillForm;