from django.db import models
from django.contrib.auth.models import User
import uuid
from django.conf import settings
from .constants import PRODUCT_TYPE


class Franchise(models.Model):
    id = models.UUIDField(primary_key = True, default = uuid.uuid4, editable = False)
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=500)
    image = models.CharField(max_length=200)
    follower = models.ManyToManyField(
        User,
        related_name='subscriptions'
    )

    def __str__(self):
        return self.title

class Publisher(models.Model):
    id = models.UUIDField(primary_key = True, default = uuid.uuid4, editable = False)
    name = models.CharField(max_length=100)
    website = models.CharField(max_length=200)
    image = models.CharField(max_length=200)

    def __str__(self):
        return self.name

class Product(models.Model):
    type = models.CharField(max_length=100, choices=PRODUCT_TYPE, default=PRODUCT_TYPE["MANGA"])

    isbn = models.CharField(primary_key = True, max_length=50, editable = False)
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=500)
    
    image = models.CharField(max_length=200)
    link_to_provider = models.CharField(max_length=200)
    release_date = models.DateField()
    
    franchise = models.ForeignKey(Franchise, related_name="products", on_delete=models.CASCADE)
    publisher = models.ForeignKey(Publisher, related_name="products", on_delete=models.CASCADE)
    owners = models.ManyToManyField(User, related_name='owned_products', blank=True)

    def __str__(self):
        return self.title


class DeviceToken(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='devicetoken_set'
    )
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'device_tokens'
        unique_together = ('user', 'token')

    def __str__(self):
        return f"{self.user.username}'s device token"

