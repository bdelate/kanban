from rest_framework import generics
from rest_framework.views import APIView
from .models import Board, Column, Card
from .serializers import BoardSerializer, ColumnSerializer, CardSerializer
from rest_framework import status
from rest_framework.response import Response
from django.db.models import Q, F


class BoardDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Board.objects.prefetch_related('columns', 'columns__cards')
    serializer_class = BoardSerializer


class CardDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Card.objects.all()
    serializer_class = CardSerializer


class Cards(APIView):
    serializer_class = CardSerializer

    def patch(self, request):
        card_ids = [card['id'] for card in request.data['cards']]
        cards = Card.objects.filter(id__in=card_ids)
        serializer = CardSerializer(instance=cards,
                                    data=request.data['cards'],
                                    many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.validated_data, status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
