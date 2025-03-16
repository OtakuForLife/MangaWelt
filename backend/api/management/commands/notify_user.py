from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import Product, DeviceToken
from firebase_admin import messaging, initialize_app, credentials
import os

class Command(BaseCommand):
    help = 'Sends notifications for products released today to users following their franchises'

    def __init__(self):
        super().__init__()
        # Initialize Firebase Admin SDK
        cred = credentials.Certificate(os.getenv('FIREBASE_ADMIN_SDK_PATH'))
        initialize_app(cred)

    def send_firebase_notification(self, tokens, title, body):
        if not tokens:
            return
        
        message = messaging.MulticastMessage(
            tokens=tokens,
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
        )
        
        try:
            response = messaging.send_multicast(message)
            self.stdout.write(f'Successfully sent message to {response.success_count} devices')
            if response.failure_count > 0:
                self.stdout.write(self.style.WARNING(
                    f'Failed to send message to {response.failure_count} devices'
                ))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error sending notification: {str(e)}'))

    def handle(self, *args, **kwargs):
        today = timezone.now().date()
        
        # Get all products released today
        today_products = Product.objects.filter(
            release_date__date=today
        ).select_related('franchise')
        
        notifications_sent = 0
        for product in today_products:
            # Get all users following this product's franchise
            followers = product.franchise.follower.all()
            
            # Group tokens by batches of 500 (Firebase limit)
            all_tokens = []
            for user in followers:
                user_tokens = DeviceToken.objects.filter(user=user).values_list('token', flat=True)
                all_tokens.extend(user_tokens)
            
            if all_tokens:
                # Prepare notification content
                title = f"New Release: {product.title}"
                body = f"A new volume from {product.franchise.title} is now available!"
                
                # Send notifications in batches of 500
                for i in range(0, len(all_tokens), 500):
                    token_batch = all_tokens[i:i + 500]
                    self.send_firebase_notification(token_batch, title, body)
                    notifications_sent += len(token_batch)
            
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully sent {notifications_sent} notifications '
                f'for {today_products.count()} products'
            )
        )
