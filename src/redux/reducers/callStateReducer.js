import { createSlice } from "@reduxjs/toolkit";

const callStateSlice = createSlice({
  name: "callState",
  initialState: {
    callstate: "idle",
  },
  reducers: {
    changeCallState: (state, { payload }) => {
      state.callstate = payload;
    },
  },
});

export const callStateReducer = callStateSlice.reducer;
export const { changeCallState } = callStateSlice.actions;
