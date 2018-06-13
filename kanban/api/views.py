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
        # return Response(status=status.HTTP_401_UNAUTHORIZED)

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
    permission_classes = (IsAuthenticated, CanRetrieveUpdateDestroy)

    queryset = Card.objects.select_related('column', 'column__board')
    serializer_class = ExistingCardSerializer


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
                                            many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.validated_data, status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SignUp(APIView):

    def post(self, request):
        serializer = CreateUserSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.create(serializer.validated_data)
            return Response({'token': token}, status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
