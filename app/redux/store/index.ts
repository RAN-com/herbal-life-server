/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import logger from "redux-logger";
import staffSlice from "../features/user/card";

// Define RootState type based on combined reducers
const appReducer = combineReducers({
  card: staffSlice,
});

// Persist configuration
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["card"], // List of reducers to persist
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, appReducer);

// Configure the store with proper typing
export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat([logger]),
});

// Persistor export
export const persistor = persistStore(store);

// Type definitions
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
