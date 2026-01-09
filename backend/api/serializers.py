from django.contrib.auth.models import User
from rest_framework import serializers
from datetime import datetime
from .models import Product, Publisher, Franchise


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {
            "password": {"write_only": True},
            "subscriptions": {"required": False}  # Make subscriptions optional
        }

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user


class ProductSerializer(serializers.ModelSerializer):
    release_date = serializers.DateField(format='%d.%m.%Y', input_formats=['%d.%m.%Y'])

    class Meta:
        model = Product
        fields = ['isbn', 'title', 'description', 'image', 'release_date', 'type', 'link_to_provider', 'franchise', 'publisher', 'is_owned']
        extra_kwargs = {}


class FranchiseSerializer(serializers.ModelSerializer):
    products = serializers.SerializerMethodField()

    class Meta:
        model = Franchise
        fields = ["id", "title", "description", "image", "products", "is_followed"]

    def get_products(self, obj):
        return [product.isbn for product in obj.products.all()]


class PublisherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publisher
        fields = ["id", "name", "website", "image", "products"]
        extra_kwargs = {}
