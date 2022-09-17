import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux'
import type {RootState, AppDispatch} from './store'
import {useEffect, useState} from "react"

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
