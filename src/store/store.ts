import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import { combineReducers } from '@reduxjs/toolkit'
import storage from 'redux-persist/lib/storage'

import candidatesSlice from './candidatesSlice'
import interviewSlice from './interviewSlice'
import uiSlice from './uiSlice'
import authSlice from './authSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['candidates', 'interview']
}

const rootReducer = combineReducers({
  candidates: candidatesSlice,
  interview: interviewSlice,
  ui: uiSlice,
  auth: authSlice,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch