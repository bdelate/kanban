from rest_framework import generics
from rest_framework.views import APIView
from .models import Board, Column, Card
from.serializers import (BoardSerializer,
                         ColumnSerializer,
                         ExistingColumnSerializer,
                         ExistingCardSerializer,
                         CardSerializer)
from rest_framework import status
from rest_framework.response import Response


class BoardDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve an existing board along with the associated columns and cards
    """
    queryset = Board.objects.prefetch_related('columns', 'columns__cards')
    serializer_class = BoardSerializer


class ColumnDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Update or delete an existing column
    """
    queryset = Column.objects.all()
    serializer_class = ColumnSerializer


class ColumnsCreateUpdate(APIView):

    def post(self, request):
        """
        Create new column. Add resulting column id to response data
        """
        serializer = ColumnSerializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            data = {'id': instance.id}
            data.update(serializer.data)
            return Response(data, status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        """
        Update multiple existing columns
        """
        column_ids = [column['id'] for column in request.data['columns']]
        columns = Column.objects.filter(id__in=column_ids)
        serializer = ExistingColumnSerializer(instance=columns,
                                              data=request.data['columns'],
                                              many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.validated_data, status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CardDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Update or delete an existing card
    """
    queryset = Card.objects.all()
    serializer_class = ExistingCardSerializer


class CardsCreateUpdate(APIView):

    def post(self, request):
        """
        Create new card. Add resulting card id to response data
        """
        serializer = CardSerializer(data=request.data)
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
