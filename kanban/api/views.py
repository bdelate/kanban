from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.mixins import CreateModelMixin
from .models import Board, Column, Card
from.serializers import (BoardSerializer,
                         ColumnSerializer,
                         ExistingCardSerializer,
                         NewCardSerializer)
from rest_framework import status
from rest_framework.response import Response
from django.db.models import Q, F


class BoardDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Board.objects.prefetch_related('columns', 'columns__cards')
    serializer_class = BoardSerializer


class CardDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Card.objects.all()
    serializer_class = ExistingCardSerializer


class CardsCreateUpdate(APIView):

    def post(self, request):
        """
        Create new card. Add resulting card id to response data
        """
        serializer = NewCardSerializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            data = {'id': instance.id}
            data.update(serializer.data)
            return Response(data, status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        """
        Update multiple existing cards
        """
        card_ids = [card['id'] for card in request.data['cards']]
        cards = Card.objects.filter(id__in=card_ids)
        serializer = ExistingCardSerializer(instance=cards,
                                            data=request.data['cards'],
                                            many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.validated_data, status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
