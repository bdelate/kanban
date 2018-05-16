from django.urls import include, path
from . import views

app_name = 'api'

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('boards/<int:pk>/', views.BoardDetail.as_view(), name='board_detail'),
    # path('', include(router.urls))
]
