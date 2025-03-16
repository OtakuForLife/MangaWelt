from django.core.management.base import BaseCommand
from django.db import connection
from django.apps import apps
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Removes all data from the database while preserving table structures'

    def add_arguments(self, parser):
        # Add optional --preserve-superuser flag to command
        parser.add_argument(
            '--preserve-superuser',
            action='store_true',
            help='Preserve superuser accounts',
        )

    def handle(self, *args, **options):
        # Get preserve_superuser flag value from command options
        preserve_superuser = options['preserve_superuser']
        
        # Get all registered Django models
        all_models = apps.get_models()
        
        with connection.cursor() as cursor:
            # Temporarily disable foreign key constraints based on database type
            if connection.vendor == 'mysql':
                cursor.execute('SET FOREIGN_KEY_CHECKS = 0;')
            elif connection.vendor == 'sqlite':
                cursor.execute('PRAGMA foreign_keys = OFF;')
            
            try:
                for model in all_models:
                    model_name = model.__name__
                    
                    # Skip ContentType model as it's required by Django
                    if model_name == 'ContentType':
                        continue
                    
                    # Special handling for User model when preserve_superuser is True
                    if preserve_superuser and model == get_user_model():
                        self.stdout.write(f'Removing non-superuser accounts from {model_name}...')
                        model.objects.filter(is_superuser=False).delete()
                    else:
                        self.stdout.write(f'Removing all data from {model_name}...')
                        model.objects.all().delete()
                    
                self.stdout.write(self.style.SUCCESS('Successfully cleared all data from the database'))
                
            finally:
                # Re-enable foreign key constraints
                if connection.vendor == 'mysql':
                    cursor.execute('SET FOREIGN_KEY_CHECKS = 1;')
                elif connection.vendor == 'sqlite':
                    cursor.execute('PRAGMA foreign_keys = ON;')
