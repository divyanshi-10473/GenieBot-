import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth'
import projectReducer from './project'
import inviteReducer from './invites'
import messageReducer from './message'
; 

const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projectReducer,
    projectInvites: inviteReducer,
    message: messageReducer,

  },
   middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;