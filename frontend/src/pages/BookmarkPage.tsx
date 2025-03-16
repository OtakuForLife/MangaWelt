import { useEffect } from 'react';
import { PageLayout } from '../components/common/Layout/PageLayout';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectIsAuthenticated } from '../redux/slices/authSlice';
import { useHistory } from 'react-router';
import { log, LogLevel } from '../utils/logger';
import Loading from '../components/Loading';
import FranchiseCardView from '../components/FranchiseCardView';
import { IonText } from '@ionic/react';
import { 
    selectUserStatus,
    selectFollowedFranchiseIds,
    fetchUserData 
} from '../redux/slices/userSlice';
import {
    selectFranchises,
    selectFranchisesStatus,
    fetchFranchises
} from '../redux/slices/franchiseSlice';

function BookmarkPage() {
    const dispatch = useAppDispatch();
    const franchises = useAppSelector(selectFranchises);
    const followedFranchiseIds = useAppSelector(selectFollowedFranchiseIds);
    const followedFranchises = followedFranchiseIds
        .map(id => franchises[id])
        .filter(franchise => franchise !== undefined);
    
    const franchisesStatus = useAppSelector(selectFranchisesStatus);
    const userStatus = useAppSelector(selectUserStatus);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const history = useHistory();

    useEffect(() => {
        if (!isAuthenticated) {
            history.push('/login');
            return;
        }

        if (userStatus === 'idle') {
            dispatch(fetchUserData())
                .unwrap()
                .then(() => {
                    log('Successfully fetched user data', LogLevel.INFO, 'BookmarkPage');
                })
                .catch(() => {
                    log('Failed to fetch user data', LogLevel.ERROR, 'BookmarkPage');
                });
        }

        if (franchisesStatus === 'idle') {
            dispatch(fetchFranchises())
                .unwrap()
                .then(() => {
                    log('Successfully fetched franchises', LogLevel.INFO, 'BookmarkPage');
                })
                .catch(() => {
                    log('Failed to fetch franchises', LogLevel.ERROR, 'BookmarkPage');
                });
        }
    }, [isAuthenticated, history, dispatch, userStatus, franchisesStatus]);

    if (!isAuthenticated) {
        return null; // Will redirect to login
    }

    if (userStatus === 'loading' || franchisesStatus === 'loading') {
        return (
            <PageLayout title="Bookmarks">
                <Loading />
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Bookmarks">
            {followedFranchises.length > 0 ? (
                <FranchiseCardView franchises={followedFranchises} />
            ) : (
                <div className="ion-padding ion-text-center">
                    <IonText color="medium">
                        <h2>No bookmarked franchises</h2>
                        <p>Start following franchises to see them here!</p>
                    </IonText>
                </div>
            )}
        </PageLayout>
    );
}

export default BookmarkPage;
