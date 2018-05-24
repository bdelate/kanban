from django.urls import include, path
from . import views

app_name = 'api'

urlpatterns = [
    path('boards/<int:pk>/',
         views.BoardDetail.as_view(),
         name='board_detail'),
    path('cards/<int:pk>/',
         views.CardDetail.as_view(),
         name='card_detail'),
    path('cards/',
         views.CardsCreateUpdate.as_view(),
         name='cards_create_update'),
]
