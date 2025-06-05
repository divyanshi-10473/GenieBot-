import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState={
    isAuthenticated: false,
    isLoading: true,
    UsersList:[],
    user: null
}

export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:3000/users/register', formData, {
        withCredentials: true,
      });
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue("Something went wrong");
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:3000/users/login', formData, {
        withCredentials: true,
      });
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return rejectWithValue(err.response.data.message);
      } else {
        return rejectWithValue("Something went wrong");
      }
    }
  }
);


export const getAllUsers = createAsyncThunk(
  'users/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('http://localhost:3000/users/get-user', {
        withCredentials: true, 
      });

      return response.data; 
    } catch (err) {
      if (err.response && err.response.data) {
        return rejectWithValue(err.response.data.message);
      } else {
        return rejectWithValue('Something went wrong');
      }
    }
  }
);


export const logoutUser = createAsyncThunk(
  "/auth/logout",

  async () => {
    const response = await axios.post(
      "http://localhost:3000/users/logout",
      {},
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);
export const checkAuth = createAsyncThunk(
  'auth/checkauth',
  async () => {
    try {
      const response = await axios.get('http://localhost:3000/users/check-auth',  {
        withCredentials: true,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          
        }

      });
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return rejectWithValue(err.response.data.message);
      } else {
        return rejectWithValue("Something went wrong");
      }
    }
  }
);



const authSlice = createSlice({
      name: "auth",
      initialState,
      reducers: {
        setUser: (state,action)=>{
              
        }
      },
      extraReducers: (builder) => {
        builder
          .addCase(registerUser.pending, (state) => {
            state.isLoading = true;
          })
          .addCase(registerUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
          })
          .addCase(registerUser.rejected, (state) => {
            state.isLoading = false;
            state.isAuthenticated = false;
          })
          .addCase(loginUser.pending, (state) => {
            state.isLoading = true;
          })
          .addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.user =action.payload.success ?   action.payload.user : null ;
            console.log("login user",action.payload);
            state.isAuthenticated =action.payload.success ? true : false;
          })
          .addCase(loginUser.rejected, (state) => {
            state.isLoading = false;
            state.user = null;
            state.isAuthenticated = false;
          })
          .addCase(checkAuth.pending, (state) => {
            state.isLoading = true;
          })
          .addCase(checkAuth.fulfilled, (state, action) => {
            state.isLoading = false;
            state.user =action.payload.success ?   action.payload.user : null ;
            state.isAuthenticated =action.payload.success ? true : false;
          })
          .addCase(checkAuth.rejected, (state) => {
            state.isLoading = false;
            state.user = null;
            state.isAuthenticated = false;
          }).addCase(logoutUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.user = null;
            state.isAuthenticated = false;
          }).addCase(getAllUsers.pending,(state)=>{
                  state.isLoading = true;
          
              }).addCase(getAllUsers.fulfilled,(state,action)=>{
                  console.log(action?.payload?.data);
                  state.isLoading = false;
                  state.UsersList = action?.payload?.data;
              }).addCase(getAllUsers.rejected,(state,action)=>{
                  state.isLoading = false;
                  state.UsersList = [];
              })

        }


})



export const {setUser} = authSlice.actions;
export default authSlice.reducer;