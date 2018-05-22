from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from .mixins import TestDataMixin
from api.models import Card, Column


class BoardDetailTest(APITestCase, TestDataMixin):

    @classmethod
    def setUpTestData(cls):

        cls.create_test_data()

    def test_retrieve_invalid_board(self):
        url = reverse('api:board_detail', args=[100])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_retrieve_board_data(self):
        url = reverse('api:board_detail', args=[1])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['columns']), 2)

        # test correct column content and order
        self.assertEqual(len(response.data['columns'][0]['cards']), 3)
        self.assertEqual(response.data['columns'][0]['name'], 'first column')
        self.assertEqual(len(response.data['columns'][1]['cards']), 3)
        self.assertEqual(response.data['columns'][1]['name'], 'second column')

        # test correct card content and order
        self.assertEqual(response.data['columns'][0]['cards'][0]['task'],
                         'column 1 card 1')
        self.assertEqual(response.data['columns'][0]['cards'][1]['task'],
                         'column 1 card 2')
        self.assertEqual(response.data['columns'][0]['cards'][2]['task'],
                         'column 1 card 3')


class CardDetailTest(APITestCase, TestDataMixin):

    @classmethod
    def setUpTestData(cls):

        cls.create_test_data()

    def test_update_invalid_card(self):
        url = reverse('api:card_detail', args=[100])
        response = self.client.patch(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_task(self):
        card = Card.objects.first()
        url = reverse('api:card_detail', args=[card.id])
        response = self.client.patch(url,
                                     {'task': 'updated', 'id': card.id},
                                     format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        card.refresh_from_db()
        self.assertEqual(card.task, 'updated')

    def test_reorder_cards(self):
        """
        Reorder first column third card to first column first card position
        """
        column = Column.objects.first()
        first_card = Card.objects.get(column_id=column.id, position_id=0)
        second_card = Card.objects.get(column_id=column.id, position_id=1)
        third_card = Card.objects.get(column_id=column.id, position_id=2)
        self.assertEqual(first_card.task, 'column 1 card 1')
        self.assertEqual(second_card.task, 'column 1 card 2')
        self.assertEqual(third_card.task, 'column 1 card 3')

        cards = [{
            'id': third_card.id,
            'task': 'column 1 card 3',
            'position_id': 0,
            'column_id': column.id
        }, {
            'id': second_card.id,
            'task': 'column 1 card 2',
            'position_id': 1,
            'column_id': column.id
        }, {
            'id': first_card.id,
            'task': 'column 1 card 1',
            'position_id': 2,
            'column_id': column.id
        }]
        data = {'cards': cards}

        url = reverse('api:cards')
        response = self.client.patch(url, data, format='json')

        first_card = Card.objects.get(column_id=column.id, position_id=0)
        second_card = Card.objects.get(column_id=column.id, position_id=1)
        third_card = Card.objects.get(column_id=column.id, position_id=2)

        self.assertEqual(first_card.task, 'column 1 card 3')
        self.assertEqual(second_card.task, 'column 1 card 2')
        self.assertEqual(third_card.task, 'column 1 card 1')

    def test_move_card_to_different_column(self):
        """
        Move first card in first column to last column
        """
        first_column = Column.objects.first()
        first_column_cards = Card.objects.filter(column_id=first_column.id)
        num_first_column_cards = len(first_column_cards)
        first_card = Card.objects.get(column_id=first_column.id, position_id=0)

        last_column = Column.objects.last()
        last_column_cards = Card.objects.filter(column_id=last_column.id)
        num_last_column_cards = len(last_column_cards)

        # construct and send patch request
        cards = [{
            'id': first_card.id,
            'task': 'column 1 card 1',
            'position_id': len(last_column_cards),
            'column_id': last_column.id
        }]
        data = {'cards': cards}
        url = reverse('api:cards')
        response = self.client.patch(url, data, format='json')

        # refresh db data
        first_card.refresh_from_db()
        first_column_cards = Card.objects.filter(column_id=first_column.id)
        last_column_cards = Card.objects.filter(column_id=last_column.id)

        # assert that the card has moved to the last column
        self.assertEqual(first_card.column_id, last_column.id)
        self.assertEqual(len(first_column_cards), num_first_column_cards - 1)
        self.assertEqual(len(last_column_cards), num_last_column_cards + 1)
