"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface userSliceType {
    userData: Object
    status: Boolean
}


const initialState = {
    userData: null,
    status: false
}

const authSlice = createSlice({
    name:'auth',
    initialState,
    reducers:{
        login: (state, action) => {
            state.userData = action.payload;
            state.status = true
        },
        logout: (state, action) => {
            state.userData = null;
            state.status = false;
        }
    }
})

export const {login, logout} = authSlice.actions;

export default authSlice.reducer;