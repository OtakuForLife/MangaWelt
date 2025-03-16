import { IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/react';

interface BaseCardProps {
    title?: string;
    children: React.ReactNode;
    href?: string;
    className?: string;
    imageUrl?: string;
    imageAlt?: string;
    topRightContent?: React.ReactNode;
}

export function BaseCard({
    title,
    children,
    href,
    className = '',
    imageUrl,
    imageAlt,
    topRightContent,
}: BaseCardProps) {
    return (
        <IonCard className={`relative ${className}`} href={href}>
            {topRightContent}
            {imageUrl && (
                <img 
                    src={imageUrl} 
                    alt={imageAlt || title} 
                    className='h-48 w-96 object-scale-down'
                />
            )}
            {title && (
                <IonCardHeader class='' className='sm:h-25 md:h-25 pt-1 pb-1 md:pt-4 md:pb-4'>
                    <IonCardTitle class='ion-text-wrap ion-text-sm-center' className='text-sm md:text-lg lg:text-xl line-clamp-1 sm:line-clamp-2 md:line-clamp-2'>{title}</IonCardTitle>
                </IonCardHeader>
            )}
            <IonCardContent class='ion-text-start ion-no-padding' className='h-5 md:h-10 text-sm md:text-base'>
                {children}
            </IonCardContent>
        </IonCard>
    );
}