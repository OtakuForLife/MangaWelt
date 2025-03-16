import { useEffect } from 'react';
//import { log, LogLevel } from '../utils/logger';
import { useAppDispatch, useAppSelector } from '../redux/hooks';

interface FetchConfig<T> {
    selector: (state: any) => T;
    statusSelector: (state: any) => 'idle' | 'loading' | 'succeeded' | 'failed';
    fetchAction: any;
    component: string;
}

export function useFetch<T>({ selector, statusSelector, fetchAction, component }: FetchConfig<T>) {
    const dispatch = useAppDispatch();
    const data = useAppSelector(selector);
    const status = useAppSelector(statusSelector);

    useEffect(() => {
        if (status === 'idle') {
            // log(`Fetching data for ${component}`, LogLevel.DEBUG, component);
            dispatch(fetchAction());
        }
    }, [status, dispatch, component, fetchAction]);

    return { data, status };
}