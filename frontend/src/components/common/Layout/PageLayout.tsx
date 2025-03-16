import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
} from '@ionic/react';
import LoginButton from '../../LoginButton';

interface PageLayoutProps {
    title: string;
    children: React.ReactNode;
    showMenu?: boolean;
    showLoginButton?: boolean;
    className?: string;
}

export function PageLayout({
    title,
    children,
    showMenu = true,
    showLoginButton = true,
    className = '',
}: PageLayoutProps) {
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    {showMenu && (
                        <IonButtons slot="start">
                            <IonMenuButton />
                        </IonButtons>
                    )}
                    <IonTitle>{title}</IonTitle>
                    {showLoginButton && <LoginButton />}
                </IonToolbar>
            </IonHeader>
            <IonContent className={className}>
                {children}
            </IonContent>
        </IonPage>
    );
}