"use client";
import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";

export type RootState = ReturnType<typeof store.getState>;

const store = configureStore({
  reducer: {
    auth: authSlice,
  },
});

export default store;