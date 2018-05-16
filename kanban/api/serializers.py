from rest_framework import serializers
from .models import Board, Column, Card


class CardSerializer(serializers.ModelSerializer):

    class Meta:
        model = Card
        fields = '__all__'


class ColumnSerializer(serializers.ModelSerializer):

    cards = CardSerializer(many=True)

    class Meta:
        model = Column
        fields = '__all__'
        ordering = ['position_id']


class BoardSerializer(serializers.ModelSerializer):

    columns = ColumnSerializer(many=True)

    class Meta:
        model = Board
        exclude = ('user', 'id', 'name')
