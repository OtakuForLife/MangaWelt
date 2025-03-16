from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
import logging

logger = logging.getLogger(__name__)

from .serializers import UserSerializer, ProductSerializer, FranchiseSerializer, PublisherSerializer, UserDataSerializer
from .models import Franchise, Product, Publisher, DeviceToken


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
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]



"""
User views
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


class FollowedFranchiseList(generics.ListAPIView):
    serializer_class = FranchiseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Franchise.objects.filter(follower=self.request.user)

class FollowFranchise(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, franchise_id):
        franchise = get_object_or_404(Franchise, id=franchise_id)
        user = request.user
        
        if franchise.follower.filter(id=user.id).exists():
            franchise.follower.remove(user)
            return Response(
                {"detail": "Successfully unfollowed franchise"},
                status=status.HTTP_200_OK
            )
        else:
            franchise.follower.add(user)
            return Response(
                {"detail": "Successfully followed franchise"},
                status=status.HTTP_200_OK
            )

class UnfollowFranchise(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, franchise_id):
        franchise = get_object_or_404(Franchise, id=franchise_id)
        user = request.user
        
        if not franchise.follower.filter(id=user.id).exists():
            return Response(
                {"detail": "Not following this franchise"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        franchise.follower.remove(user)
        return Response(
            {"detail": "Successfully unfollowed franchise"},
            status=status.HTTP_200_OK
        )

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

class DeviceTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        DeviceToken.objects.update_or_create(
            user=request.user,
            token=token,
        )
        
        return Response({'status': 'Token registered'}, status=status.HTTP_200_OK)

class ToggleProductOwned(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, product_id):
        product = get_object_or_404(Product, isbn=product_id)
        user = request.user
        
        if product.owners.filter(id=user.id).exists():
            product.owners.remove(user)
            return Response(
                {"detail": "Product marked as not owned"},
                status=status.HTTP_200_OK
            )
        else:
            product.owners.add(user)
            return Response(
                {"detail": "Product marked as owned"},
                status=status.HTTP_200_OK
            )


class UserDataView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserDataSerializer

    def get_object(self):
        return self.request.user


