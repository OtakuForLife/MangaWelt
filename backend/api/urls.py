from django.urls import path
from . import views

urlpatterns = [
    # Admin routes
    path("products/", views.ProductListCreate.as_view(), name="create-write-product-list"),
    path("franchises/", views.FranchiseListCreate.as_view(), name="create-write-franchise-list"),
    path("publishers/", views.PublisherListCreate.as_view(), name="create-write-publisher-list"),

    # Public routes
    path("products/list/", views.ProductList.as_view(), name="product-list"),
    path("franchises/list/", views.FranchiseList.as_view(), name="franchise-list"),
    path("publishers/list/", views.PublisherList.as_view(), name="publisher-list"),

    # User action routes (no auth required - single user app)
    path("products/<str:product_id>/toggle-owned/", views.ToggleProductOwned.as_view(), name="toggle-product-owned"),
    path("franchises/<uuid:franchise_id>/follow/", views.ToggleFranchiseFollow.as_view(), name="toggle-franchise-follow"),

    # Utility routes
    path('logs/', views.LogEntryView.as_view(), name='app-logs'),
]
