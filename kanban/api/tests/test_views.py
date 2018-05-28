from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from .mixins import TestDataMixin
from api.models import Board, Card, Column


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


class ColumnDetailTest(APITestCase, TestDataMixin):

    @classmethod
    def setUpTestData(cls):

        cls.create_test_data()

    def test_update_invalid_column(self):
        url = reverse('api:column_detail', args=[100])
        response = self.client.patch(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_task(self):
        column = Column.objects.first()
        url = reverse('api:column_detail', args=[column.id])
        data = {
            'id': column.id,
            'name': 'new column name'
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        column.refresh_from_db()
        self.assertEqual(column.name, 'new column name')


class ColumnCreateUpdateTest(APITestCase, TestDataMixin):

    @classmethod
    def setUpTestData(cls):

        cls.create_test_data()

    def test_create_column(self):
        board = Board.objects.first()
        columns = Column.objects.filter(board_id=board.id)
        data = {
            'id': -1,
            'spinner': 'true',
            'name': 'new column',
            'position_id': len(columns),
            'board_id': board.id,
            'cards': []
        }

        url = reverse('api:column_create_update')
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        new_column = Column.objects.last()
        self.assertEqual(new_column.name, 'new column')
        self.assertEqual(new_column.board_id, board.id)

    def test_create_column_fails(self):
        data = {}
        url = reverse('api:column_create_update')
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


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

    def test_delete_card(self):
        card = Card.objects.first()
        card_task = card.task
        url = reverse('api:card_detail', args=[card.id])
        response = self.client.delete(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        card = Card.objects.filter(task=card_task)
        self.assertEqual(len(card), 0)


class CardCreateUpdateTest(APITestCase, TestDataMixin):

    @classmethod
    def setUpTestData(cls):

        cls.create_test_data()

    def test_create_card(self):
        column = Column.objects.first()
        before_cards = Card.objects.filter(column_id=column.id)
        data = {
            'id': -1,
            'spinner': 'true',
            'task': 'newly created test task',
            'column_id': column.id,
            'position_id': len(before_cards)
        }

        url = reverse('api:cards_create_update')
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        after_cards = Card.objects.filter(column_id=column.id)
        self.assertEqual(len(before_cards) + 1, len(after_cards))
        card = Card.objects.last()
        self.assertEqual(card.task, 'newly created test task')
        self.assertEqual(card.column_id, column.id)

    def test_create_card_fails(self):
        data = {}
        url = reverse('api:cards_create_update')
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reorder_cards(self):
        """
        Test updating of multiple cards, eg:
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

        url = reverse('api:cards_create_update')
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
        url = reverse('api:cards_create_update')
        response = self.client.patch(url, data, format='json')

        # refresh db data
        first_card.refresh_from_db()
        first_column_cards = Card.objects.filter(column_id=first_column.id)
        last_column_cards = Card.objects.filter(column_id=last_column.id)

        # assert that the card has moved to the last column
        self.assertEqual(first_card.column_id, last_column.id)
        self.assertEqual(len(first_column_cards), num_first_column_cards - 1)
        self.assertEqual(len(last_column_cards), num_last_column_cards + 1)
