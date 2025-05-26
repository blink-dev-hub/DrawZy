"use client";

import React, { ReactNode } from "react";
import { Provider } from "react-redux"; // Correct import from react-redux
import store from "./store";



export function ReduxProvider({ children }: any) {
  return <Provider store={store}>{children}</Provider>
}