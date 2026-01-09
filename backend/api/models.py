from django.db import models
import uuid
from .constants import PRODUCT_TYPE


class Franchise(models.Model):
    id = models.UUIDField(primary_key = True, default = uuid.uuid4, editable = False)
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=500)
    image = models.CharField(max_length=200)
    is_followed = models.BooleanField(default=False)


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
    is_owned = models.BooleanField(default=False)

    def __str__(self):
        return self.title

