import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: null,
        status: 'idle',
    },
    reducers: {
        login: (state, action) => {
            state.token = action.payload.token;
            state.status = 'loggedIn';
        },
        logout: (state) => {
            state.token = null;
            state.status = 'loggedOut';
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
