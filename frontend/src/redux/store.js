import { configureStore } from '@reduxjs/toolkit'
import formReducer from './formSlice'
import chatReducer from './chatSlice'
import adminReducer from './adminSlice'

export const store = configureStore({
  reducer: {
    form: formReducer,
    chat: chatReducer,
    admin: adminReducer,
  },
})
