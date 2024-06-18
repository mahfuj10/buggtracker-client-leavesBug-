import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '../../services/axios';

const initialState = {
  loading: false,
  message: ''
};

export const sendMail = createAsyncThunk(
  'email/data',
  async (data) => {
    const response = await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/email/send`, data);

    return response.data;
  }
);


export const dataSlice = createSlice({
  name: 'email',
  initialState,
  reducers: {
    updateMessage: (state, { payload }) => {
      state.message = payload;
    },
    clearMessage: (state) => {
      state.message = '';
    },
    setEmailLoading: (state, { payload }) => {
      state.loading = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMail.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMail.fulfilled, (state) => {
        state.loading = false;
        state.message = 'Email sent...!';
      })
      .addCase(sendMail.rejected, (state) => {
        state.loading = false;
        state.message = 'Something went wrong!';
      });
  },
});

export const { updateMessage, clearMessage, setEmailLoading} = dataSlice.actions;

export default dataSlice.reducer;
