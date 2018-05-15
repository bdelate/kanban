# from rest_framework import viewsets
from rest_framework import generics
from .models import Board
from .serializers import BoardSerializer


class BoardDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Board.objects.prefetch_related('columns', 'columns__cards')
    serializer_class = BoardSerializer
