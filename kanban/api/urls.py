from django.urls import include, path
from . import views
from rest_framework_jwt.views import obtain_jwt_token

app_name = 'api'

urlpatterns = [
    path('signup/',
         views.SignUp.as_view(),
         name='signup'),
    path('obtain-token/',
         obtain_jwt_token),
    path('boards/<int:pk>/',
         views.BoardDetail.as_view(),
         name='board_detail'),
    path('boards/',
         views.BoardListCreate.as_view(),
         name='board_list_create'),
    path('columns/<int:pk>/',
         views.ColumnDetail.as_view(),
         name='column_detail'),
    path('columns/',
         views.ColumnsCreateUpdate.as_view(),
         name='columns_create_update'),
    path('cards/<int:pk>/',
         views.CardDetail.as_view(),
         name='card_detail'),
    path('cards/',
         views.CardsCreateUpdate.as_view(),
         name='cards_create_update'),
]
