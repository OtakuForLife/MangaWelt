

import { IonSpinner } from '@ionic/react';

export default function Loading() {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
        }}>
            <IonSpinner name="crescent" />
        </div>
    );
}