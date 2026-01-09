import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BaseCardProps {
    title?: string;
    children: React.ReactNode;
    href?: string;
    className?: string;
    imageUrl?: string;
    imageAlt?: string;
    topRightContent?: React.ReactNode;
    onClick?: () => void;
}

export function BaseCard({
    title,
    children,
    href,
    className = '',
    imageUrl,
    imageAlt,
    topRightContent,
    onClick,
}: BaseCardProps) {
    const content = (
        <Card className={`relative ${className} hover:shadow-lg transition-shadow`}>
            {topRightContent}
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={imageAlt || title}
                    className='h-48 w-96 object-scale-down'
                />
            )}
            {title && (
                <CardHeader className='sm:h-25 md:h-25 pt-1 pb-1 md:pt-4 md:pb-4'>
                    <CardTitle className='text-sm md:text-lg lg:text-xl line-clamp-1 sm:line-clamp-2 md:line-clamp-2 text-center'>
                        {title}
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent className='h-5 md:h-10 text-sm md:text-base p-0 text-start'>
                {children}
            </CardContent>
        </Card>
    );

    if (href || onClick) {
        return (
            <div onClick={onClick} className="block cursor-pointer">
                {content}
            </div>
        );
    }

    return <div>{content}</div>;
}

