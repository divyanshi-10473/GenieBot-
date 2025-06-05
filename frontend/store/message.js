
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  isLoading: false,
  messagesList: [],
};




 export const sendMessages = createAsyncThunk(
  "messages/sendMessage",
  async (messageData, { rejectWithValue }) => {

    try {
      const response = await axios.post(
        `http://localhost:3000/message/send`,
        messageData,
        {
          withCredentials: true,
        }
      );
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

export const fetchMessagesByProject = createAsyncThunk(
  "messages/fetchMessagesByProject",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:3000/message/fetch/${projectId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return rejectWithValue(err.response.data.message);
      } else {
        return rejectWithValue("Failed to fetch messages");
      }
    }
  }
);


export const deleteConversation = createAsyncThunk(
  'messages/deleteConversation',
  async (projectId, { rejectWithValue }) => {
    try {
      console.log("Deleting conversation for projectId:", projectId);
      const res = await axios.delete(`http://localhost:3000/message/clear/${projectId}`, {
        withCredentials: true,
      });
      return res?.data; // just return projectId for clearing state
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error deleting conversation');
    }
  }
);








const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      // sendMessage
      .addCase(sendMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messagesList.push(action.payload);
      })
      .addCase(sendMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to send message";
      })

      // fetchMessagesByProject
      .addCase(fetchMessagesByProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessagesByProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messagesList = action.payload;
      })
      .addCase(fetchMessagesByProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch messages";
      });
  },

});


export default messageSlice.reducer;
