import { useEffect } from 'react';
import { PageLayout } from '../components/common/Layout/PageLayout';
import FranchiseCardView from '../components/FranchiseCardView';
import Loading from '../components/Loading';
import Franchise from '../models/Franchise';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectFranchises, selectFranchisesStatus, fetchFranchises } from '../redux/slices/franchiseSlice';
import { log, LogLevel } from '../utils/logger';
import { useLoadUserData } from '../hooks/useLoadUserData';

function FranchisePage() {
    const dispatch = useAppDispatch();
    const franchiseMap = useAppSelector(selectFranchises);
    const status = useAppSelector(selectFranchisesStatus);
    
    // Load user data when authenticated
    useLoadUserData();

    const franchises: Franchise[] = Object.values(franchiseMap);
      
    log("FranchiseMap: "+JSON.stringify(franchiseMap), LogLevel.INFO);
    
    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchFranchises());
        }
    }, [status, dispatch]);
    
    if (status === 'loading') {
        return <Loading />;
    }

    return (
        <PageLayout title="Franchises">
            <FranchiseCardView franchises={franchises}/>
        </PageLayout>
    );
}

export default FranchisePage;
