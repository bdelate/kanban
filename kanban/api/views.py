from rest_framework import viewsets
from .models import Board
from .serializers import BoardSerializer


class BoardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
