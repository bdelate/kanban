from rest_framework import serializers
from .models import Board, Column, Card


class CardListSerializer(serializers.ListSerializer):

    def update(self, instance, validated_data):
        card_mapping = {card.id: card for card in instance}
        data_mapping = {item['id']: item for item in validated_data}
        cards = []
        for card_id, data in data_mapping.items():
            card = card_mapping[card_id]
            self.child.update(card, data)
            cards.append(card)
        return cards


class ExistingCardSerializer(serializers.ModelSerializer):

    id = serializers.IntegerField()
    column_id = serializers.IntegerField()

    class Meta:
        model = Card
        fields = ('task', 'id', 'position_id', 'column_id')
        list_serializer_class = CardListSerializer


class NewCardSerializer(serializers.ModelSerializer):

    column_id = serializers.IntegerField()

    class Meta:
        model = Card
        fields = ('task', 'position_id', 'column_id')


class ColumnSerializer(serializers.ModelSerializer):

    cards = ExistingCardSerializer(many=True)
    board_id = serializers.IntegerField()

    class Meta:
        model = Column
        fields = ('name', 'id', 'position_id', 'board_id', 'cards')


class BoardSerializer(serializers.ModelSerializer):

    columns = ColumnSerializer(many=True)

    class Meta:
        model = Board
        exclude = ('user',)
