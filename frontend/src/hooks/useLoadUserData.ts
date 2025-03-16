import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectIsAuthenticated } from '../redux/slices/authSlice';
import { selectUserStatus, fetchUserData } from '../redux/slices/userSlice';
//import { log, LogLevel } from '../utils/logger';

export function useLoadUserData() {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const userStatus = useAppSelector(selectUserStatus);

    useEffect(() => {
        if (isAuthenticated && userStatus === 'idle') {
            dispatch(fetchUserData())
                .unwrap()
                .then(() => {
                    //log('Successfully fetched user data', LogLevel.INFO, 'useLoadUserData');
                })
                .catch(() => {
                    //log('Failed to fetch user data', LogLevel.ERROR, 'useLoadUserData');
                });
        }
    }, [isAuthenticated, userStatus, dispatch]);

    return { isAuthenticated, userStatus };
}