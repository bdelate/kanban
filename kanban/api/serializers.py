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


class CardSerializer(serializers.ModelSerializer):

    id = serializers.IntegerField()
    column_id = serializers.IntegerField()

    class Meta:
        model = Card
        fields = ('task', 'id', 'position_id', 'column_id')
        list_serializer_class = CardListSerializer


class ColumnSerializer(serializers.ModelSerializer):

    cards = CardSerializer(many=True)

    class Meta:
        model = Column
        fields = '__all__'


class BoardSerializer(serializers.ModelSerializer):

    columns = ColumnSerializer(many=True)

    class Meta:
        model = Board
        exclude = ('user', 'id', 'name')
