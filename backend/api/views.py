from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
import logging

logger = logging.getLogger(__name__)

from .serializers import UserSerializer, ProductSerializer, FranchiseSerializer, PublisherSerializer
from .models import Franchise, Product, Publisher


"""
Admin views
"""
class ProductListCreate(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return Product.objects.all()

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)


class FranchiseListCreate(generics.ListCreateAPIView):
    serializer_class = FranchiseSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return Franchise.objects.all()

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)


class PublisherListCreate(generics.ListCreateAPIView):
    serializer_class = PublisherSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return Publisher.objects.all()

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)


"""
Public views
"""
class ProductList(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Product.objects.all()


class FranchiseList(generics.ListAPIView):
    serializer_class = FranchiseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Franchise.objects.all()


class PublisherList(generics.ListAPIView):
    serializer_class = PublisherSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Publisher.objects.all()

class LogEntryView(APIView):
    permission_classes = [AllowAny]  # Adjust according to your security needs

    def post(self, request):
        try:
            level = request.data.get('level', 'INFO').upper()
            tag = request.data.get('tag', '')
            message = request.data.get('message', '')
            device_info = request.data.get('device_info', {})

            log_message = f"[{tag}] {message} | Device: {device_info}"

            if level == 'DEBUG':
                logger.debug(log_message)
            elif level == 'INFO':
                logger.info(log_message)
            elif level == 'WARN' or level == 'WARNING':
                logger.warning(log_message)
            elif level == 'ERROR':
                logger.error(log_message)
            else:
                logger.info(log_message)

            return Response({'status': 'logged'}, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error processing log entry: {str(e)}")
            return Response(
                {'error': 'Failed to process log'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ToggleProductOwned(APIView):
    """
    Toggle product ownership state (global, not user-specific)
    """
    permission_classes = [AllowAny]

    def post(self, request, product_id):
        product = get_object_or_404(Product, isbn=product_id)

        # Toggle the is_owned field
        product.is_owned = not product.is_owned
        product.save()

        return Response(
            {
                "detail": "Product marked as owned" if product.is_owned else "Product marked as not owned",
                "is_owned": product.is_owned
            },
            status=status.HTTP_200_OK
        )


class ToggleFranchiseFollow(APIView):
    """
    Toggle franchise follow state (global, not user-specific)
    """
    permission_classes = [AllowAny]

    def post(self, request, franchise_id):
        franchise = get_object_or_404(Franchise, id=franchise_id)

        # Toggle the is_followed field
        franchise.is_followed = not franchise.is_followed
        franchise.save()

        return Response(
            {
                "detail": "Successfully followed franchise" if franchise.is_followed else "Successfully unfollowed franchise",
                "is_followed": franchise.is_followed
            },
            status=status.HTTP_200_OK
        )





