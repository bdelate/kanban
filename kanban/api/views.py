# from rest_framework import viewsets
from rest_framework import generics
from .models import Board
from .serializers import BoardSerializer


# class BoardViewSet(viewsets.ReadOnlyModelViewSet):
#     queryset = Board.objects.prefetch_related(
#         'column_set', 'column_set__card_set')
#     serializer_class = BoardSerializer

class BoardDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Board.objects.prefetch_related('columns', 'columns__cards')
    serializer_class = BoardSerializer
