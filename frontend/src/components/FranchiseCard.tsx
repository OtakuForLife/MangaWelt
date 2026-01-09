import { memo, useCallback } from 'react';
import { Bookmark } from 'lucide-react';
import { BaseCard } from './common/Card/BaseCard';
import Franchise from '../models/Franchise';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { toggleFranchiseFollow, selectFollowedFranchiseIds } from '../store/slices/franchiseSlice';
import { Button } from './ui/button';

interface FranchiseCardProps {
    franchise: Franchise;
    onClick?: () => void;
}

function FranchiseCard({franchise, onClick}: FranchiseCardProps) {
    const dispatch = useAppDispatch();
    const isFollowing = useAppSelector(selectFollowedFranchiseIds).includes(franchise.id);

    const handleFollowClick = useCallback(async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent card navigation when clicking the button

        try {
            await dispatch(toggleFranchiseFollow(franchise.id)).unwrap();
        } catch (error) {
            console.error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} franchise:`, error);
        }
    }, [dispatch, franchise.id, isFollowing]);

    return (
        <BaseCard
            title={franchise.title}
            onClick={onClick}
            className='w-43 sm:w-70 md:w-60 lg:w-60 p-4'
            imageUrl={franchise.image}
            imageAlt={franchise.title}
        >
            <div className="flex justify-center mt-2">
                <Button
                    onClick={handleFollowClick}
                    variant={isFollowing ? 'default' : 'secondary'}
                    size="sm"
                >
                    <Bookmark className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                    {isFollowing ? 'Bookmarked' : 'Bookmark'}
                </Button>
            </div>
        </BaseCard>
    );
}

// Memoize to prevent unnecessary re-renders
export default memo(FranchiseCard);

