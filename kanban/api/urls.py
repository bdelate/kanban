from django.urls import include, path
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets with it.
# router = DefaultRouter()
# router.register(r'boards', views.BoardViewSet)

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('boards/<int:pk>/', views.BoardDetail.as_view()),
    # path('', include(router.urls))
]
