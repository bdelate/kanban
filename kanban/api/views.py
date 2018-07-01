from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from rest_framework.views import APIView
from .models import Board, Column, Card
from.permissions import (CanRetrieveUpdateDestroy,
                         CanCreateUpdateCards,
                         CanCreateUpdateColumns)
from .serializers import (BoardSerializer,
                          ColumnSerializer,
                          ExistingColumnSerializer,
                          ExistingCardSerializer,
                          CardSerializer,
                          CreateUserSerializer)
from rest_framework import status
from rest_framework.response import Response


class BoardListCreate(APIView):
    """
    List all existing boards for a user or create a new one
    """

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        boards = Board.objects.filter(user=request.user)
        return Response({board.id: board.name for board in boards})

    def post(self, request):
        data = request.data
        data['user'] = request.user.id
        serializer = BoardSerializer(data=data)
        if serializer.is_valid():
            instance = serializer.save()
            data = {'id': instance.id}
            data.update(serializer.data)
            return Response(data, status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BoardDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve an existing board along with the associated columns and cards
    or Update / Delete a board
    """
    permission_classes = (IsAuthenticated, CanRetrieveUpdateDestroy)
    queryset = Board.objects.prefetch_related('columns', 'columns__cards')
    serializer_class = BoardSerializer


class ColumnDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Update or delete an existing column
    """
    permission_classes = (IsAuthenticated, CanRetrieveUpdateDestroy)
    queryset = Column.objects.select_related('board')
    serializer_class = ColumnSerializer

    def delete(self, request, pk):
        """
        If last board column is deleted, return response without extra data,
        else update remaining column position_ids and return them in
        the response.
        """
        try:
            column = Column.objects.get(pk=pk)
        except Column.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        num_columns = Column.objects.filter(board=column.board).count()
        column.delete()

        if column.position_id == num_columns - 1:
            return Response(status=status.HTTP_204_NO_CONTENT)

        columns = Column.objects.filter(board=column.board)
        for i, col in enumerate(columns):
            col.position_id = i
            col.save()
        serializer = ColumnSerializer(columns, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ColumnsCreateUpdate(APIView):

    permission_classes = (IsAuthenticated, CanCreateUpdateColumns)

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


class CardDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Update or delete an existing card
    """
    permission_classes = (IsAuthenticated, CanRetrieveUpdateDestroy)

    queryset = Card.objects.select_related('column', 'column__board')
    serializer_class = ExistingCardSerializer

    def delete(self, request, pk):
        """
        If last column card is deleted, return response without extra data,
        else update remaining card position_ids and return them in
        the response.
        """
        try:
            card = Card.objects.get(pk=pk)
        except Card.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        num_cards = Card.objects.filter(column=card.column_id).count()
        card.delete()

        if card.position_id == num_cards - 1:
            return Response(status=status.HTTP_204_NO_CONTENT)

        cards = Card.objects.filter(column=card.column_id)
        for i, current_card in enumerate(cards):
            current_card.position_id = i
            current_card.save()
        serializer = CardSerializer(cards, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CardsCreateUpdate(APIView):

    permission_classes = (IsAuthenticated, CanCreateUpdateCards)

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
                                            many=True,
                                            partial=True)
        if serializer.is_valid():
            result = serializer.save()
            return Response(result, status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SignUp(APIView):

    def post(self, request):
        serializer = CreateUserSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.create(serializer.validated_data)
            return Response({'token': token}, status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
