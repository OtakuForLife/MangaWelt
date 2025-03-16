import { IonButton, IonIcon } from '@ionic/react';
import { bookmark, bookmarkOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { BaseCard } from './common/Card/BaseCard';
import Franchise from '../models/Franchise';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectIsAuthenticated } from '../redux/slices/authSlice';
import { toggleFranchiseFollow, selectFollowedFranchiseIds } from '../redux/slices/userSlice';
//import { log, LogLevel } from '../utils/logger';

interface FranchiseCardProps {
    franchise: Franchise;
}

function FranchiseCard({franchise}: FranchiseCardProps) {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isFollowing = useAppSelector(selectFollowedFranchiseIds).includes(franchise.id);
    const history = useHistory();

    const handleFollowClick = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent card navigation when clicking the button
        if (!isAuthenticated) {
            history.push('/login');
            return;
        }

        try {
            await dispatch(toggleFranchiseFollow(franchise.id)).unwrap();
            // log(`Successfully ${isFollowing ? 'unfollowed' : 'followed'} franchise`, LogLevel.INFO, 'FranchiseCard');
        } catch (error) {
            // log(`Failed to ${isFollowing ? 'unfollow' : 'follow'} franchise: ${error}`, LogLevel.ERROR, 'FranchiseCard');
        }
    };

    return (
        <BaseCard 
            title={franchise.title}
            href={`/app/franchise/${franchise.id}`}
            className='w-43 sm:w-70 md:w-60 lg:w-60 ion-padding'
            imageUrl={franchise.image}
            imageAlt={franchise.title}
        >
            <div className="flex justify-center mt-2">
                <IonButton
                    onClick={handleFollowClick}
                    color={isFollowing ? 'primary' : 'medium'}
                    size="small"
                >
                    <IonIcon slot="start" icon={isFollowing ? bookmark : bookmarkOutline} />
                    {isFollowing ? 'Bookmarked' : 'Bookmark'}
                </IonButton>
            </div>
        </BaseCard>
    );
}

export default FranchiseCard;
