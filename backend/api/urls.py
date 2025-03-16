from django.urls import path
from . import views

urlpatterns = [
    # Admin routes
    path("products/", views.ProductListCreate.as_view(), name="create-write-product-list"),
    path("franchises/", views.FranchiseListCreate.as_view(), name="create-write-franchise-list"),
    path("publishers/", views.PublisherListCreate.as_view(), name="create-write-publisher-list"),
    
    # User routes
    path("products/list/", views.ProductList.as_view(), name="product-list"),
    path("franchises/list/", views.FranchiseList.as_view(), name="franchise-list"),
    path("franchises/followed/", views.FollowedFranchiseList.as_view(), name="followed-franchise-list"),
    path("franchises/<uuid:franchise_id>/follow/", views.FollowFranchise.as_view(), name="follow-franchise"),
    path("franchises/<uuid:franchise_id>/unfollow/", views.UnfollowFranchise.as_view(), name="unfollow-franchise"),
    path("publishers/list/", views.PublisherList.as_view(), name="publisher-list"),
    path('logs/', views.LogEntryView.as_view(), name='app-logs'),
    path('device-token/', views.DeviceTokenView.as_view(), name='device-token'),
    path("products/<str:product_id>/toggle-owned/", views.ToggleProductOwned.as_view(), name="toggle-product-owned"),
    path('user/data/', views.UserDataView.as_view(), name='user-data'),
]
