from rest_framework import permissions
from.models import Board, Column, Card
from django.db.models import Q


class CanCreateUpdateColumns(permissions.BasePermission):
    """
    Validates creating a new column or updating multiple existing columns,
    by ensuring the user owns the Board for the column/s in the request.
    """

    def has_permission(self, request, view):
        if 'columns' not in request.data and 'board_id' not in request.data:
            return False

        try:  # User is trying to update multiple columns
            ids = [column['id'] for column in request.data['columns']]
            query = Q(columns__in=ids)
        except KeyError:  # User is trying to create a column
            ids = [request.data['board_id']]
            query = Q(id__in=ids)

        num_columns = (Board.objects
                       .prefetch_related('columns')
                       .filter(query, user=request.user)
                       .count())
        return len(ids) == num_columns


class CanCreateUpdateCards(permissions.BasePermission):
    """
    Validates creating a new card or updating multiple existing cards,
    by ensuring the user owns the Board (and associated column) for the
    card/s in the request.
    """

    def has_permission(self, request, view):
        if 'column_id' not in request.data and 'cards' not in request.data:
            return False

        try:  # User is trying to update multiple cards
            ids = [card['id'] for card in request.data['cards']]
            query = Q(columns__cards__in=ids)
        except KeyError:  # User is trying to create a card
            ids = [request.data['column_id']]
            query = Q(columns__in=ids)

        num_cards = (Board.objects
                     .prefetch_related('columns', 'columns__cards')
                     .filter(query, user=request.user)
                     .count())
        return len(ids) == num_cards


class CanRetrieveUpdateDestroy(permissions.BasePermission):
    """
    Validates that the user owns the board for the associated object
    """

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Column):
            return obj.board.user == request.user
        elif isinstance(obj, Card):
            return obj.column.board.user == request.user
        return obj.user == request.user
