from django.contrib.auth.models import User
from django.utils.deprecation import MiddlewareMixin


class SingleUserMiddleware(MiddlewareMixin):
    """
    Middleware to automatically assign a default user to all requests.
    This enables single-user mode without requiring authentication.
    """
    
    def process_request(self, request):
        # Skip for admin URLs to allow admin login
        if request.path.startswith('/admin/'):
            return None
        
        # Get or create the default user
        default_user, created = User.objects.get_or_create(
            username='default_user',
            defaults={
                'email': 'user@mangawelt.local',
                'is_active': True,
            }
        )
        
        if created:
            # Set a password for the default user (for admin access if needed)
            default_user.set_password('mangawelt2024')
            default_user.save()
        
        # Assign the default user to the request
        request.user = default_user
        
        return None

