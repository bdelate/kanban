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
            'position_id': 0
        }, {
            'id': second_card.id,
            'task': 'column 1 card 2',
            'position_id': 1
        }, {
            'id': first_card.id,
            'task': 'column 1 card 1',
            'position_id': 2
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
