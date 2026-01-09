import { combineReducers, configureStore } from '@reduxjs/toolkit'
import productReducer from './slices/productSlice'
import franchiseReducer from './slices/franchiseSlice'

const rootReducer = combineReducers({
  products: productReducer,
  franchises: franchiseReducer,
})

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState
  })
}

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
