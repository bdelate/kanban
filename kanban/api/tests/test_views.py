from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model
from .mixins import TestDataMixin
from api.models import Board, Card, Column


class BoardListCreateTest(APITestCase, TestDataMixin):

    @classmethod
    def setUpTestData(cls):

        cls.create_test_data()

    def setUp(self):
        user = get_user_model().objects.get(username='john')
        self.client.force_authenticate(user=user)

    def test_list_user_boards(self):
        board = Board.objects.first()
        url = reverse('api:board_list_create')
        response = self.client.get(url, format='json')
        self.assertEqual(response.data[board.id], 'test board')

    def test_create_board(self):
        boards = Board.objects.count()
        data = {'name': 'new board'}
        url = reverse('api:board_list_create')
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Board.objects.count(), boards + 1)


class BoardDetailTest(APITestCase, TestDataMixin):

    @classmethod
    def setUpTestData(cls):

        cls.create_test_data()

    def setUp(self):
        user = get_user_model().objects.get(username='john')
        self.client.force_authenticate(user=user)

    def test_retrieve_invalid_board(self):
        url = reverse('api:board_detail', args=[100])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_retrieve_board_data(self):
        board = Board.objects.first()
        num_columns = Column.objects.count()
        url = reverse('api:board_detail', args=[board.id])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['columns']), num_columns)

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

    def test_update_name(self):
        board = Board.objects.first()
        url = reverse('api:board_detail', args=[board.id])
        data = {'name': 'new board name'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        board.refresh_from_db()
        self.assertEqual(board.name, 'new board name')


class ColumnDetailTest(APITestCase, TestDataMixin):

    @classmethod
    def setUpTestData(cls):

        cls.create_test_data()

    def setUp(self):
        user = get_user_model().objects.get(username='john')
        self.client.force_authenticate(user=user)

    def test_update_invalid_column(self):
        url = reverse('api:column_detail', args=[100])
        response = self.client.patch(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_name(self):
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

    def test_delete_column_success(self):
        """
        Test that column and all associated cards are deleted
        """
        column = Column.objects.first()
        column_id = column.id
        num_cards = Card.objects.filter(column_id=column_id).count()
        self.assertTrue(num_cards > 0)
        url = reverse('api:column_detail', args=[column_id])
        response = self.client.delete(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        num_cards = Card.objects.filter(column_id=column_id).count()
        self.assertTrue(num_cards == 0)
        num_columns = Column.objects.filter(id=column_id).count()
        self.assertEqual(0, num_columns)

    def test_delete_column_failure(self):
        columns = Column.objects.count()
        url = reverse('api:column_detail', args=[500])
        response = self.client.delete(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(columns, Column.objects.count())


class ColumnsCreateUpdateTest(APITestCase, TestDataMixin):

    @classmethod
    def setUpTestData(cls):

        cls.create_test_data()

    def setUp(self):
        user = get_user_model().objects.get(username='john')
        self.client.force_authenticate(user=user)

    def test_create_column(self):
        board = Board.objects.first()
        columns = Column.objects.filter(board_id=board.id).count()
        data = {
            'id': -1,
            'spinner': 'true',
            'name': 'new column',
            'position_id': columns,
            'board_id': board.id,
            'cards': []
        }

        url = reverse('api:columns_create_update')
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        new_column = Column.objects.last()
        self.assertEqual(new_column.name, 'new column')
        self.assertEqual(new_column.board_id, board.id)

    def test_create_column_fails(self):
        board = Board.objects.first()
        data = {
            'board_id': board.id
        }
        url = reverse('api:columns_create_update')
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_column_and_update_remaining_position_ids(self):
        """
        Test data contains 3 columns. Delete the second column and
        update the last columns position_id
        """
        num_columns = Column.objects.count()
        second_column = Column.objects.get(name='second column')
        last_column = Column.objects.last()

        self.assertEqual(last_column.position_id, 2)

        columns = [{
            'id': second_column.id,
            'cards': [],
            'board_id': second_column.board_id,
            'name': second_column.name,
            'position_id': 1,
            'delete': True
        }, {
            'id': last_column.id,
            'cards': [],
            'board_id': last_column.board_id,
            'name': last_column.name,
            'position_id': 1
        }]
        data = {'columns': columns}

        url = reverse('api:columns_create_update')
        response = self.client.patch(url, data, format='json')

        last_column.refresh_from_db()

        self.assertEqual(num_columns - 1, Column.objects.count())
        self.assertEqual(last_column.position_id, 1)


class CardDetailTest(APITestCase, TestDataMixin):

    @classmethod
    def setUpTestData(cls):

        cls.create_test_data()

    def setUp(self):
        user = get_user_model().objects.get(username='john')
        self.client.force_authenticate(user=user)

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

    def test_delete_card_success(self):
        card = Card.objects.first()
        card_task = card.task
        url = reverse('api:card_detail', args=[card.id])
        response = self.client.delete(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        cards = Card.objects.filter(task=card_task).count()
        self.assertEqual(cards, 0)

    def test_delete_card_failure(self):
        cards = Card.objects.count()
        url = reverse('api:card_detail', args=[500])
        response = self.client.delete(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(cards, Card.objects.count())


class CardsCreateUpdateTest(APITestCase, TestDataMixin):

    @classmethod
    def setUpTestData(cls):

        cls.create_test_data()

    def setUp(self):
        user = get_user_model().objects.get(username='john')
        self.client.force_authenticate(user=user)

    def test_create_card(self):
        column = Column.objects.first()
        before_cards = Card.objects.filter(column_id=column.id).count()
        data = {
            'id': -1,
            'spinner': 'true',
            'task': 'newly created test task',
            'column_id': column.id,
            'position_id': before_cards
        }

        url = reverse('api:cards_create_update')
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        after_cards = Card.objects.filter(column_id=column.id).count()
        self.assertEqual(before_cards + 1, after_cards)
        card = Card.objects.last()
        self.assertEqual(card.task, 'newly created test task')
        self.assertEqual(card.column_id, column.id)

    def test_create_card_fails(self):
        column = Column.objects.first()
        data = {
            'column_id': column.id
        }
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
        first_column_cards = Card.objects.filter(
            column_id=first_column.id).count()
        num_first_column_cards = first_column_cards
        first_card = Card.objects.get(column_id=first_column.id, position_id=0)

        last_column = Column.objects.last()
        last_column_cards = Card.objects.filter(
            column_id=last_column.id).count()
        num_last_column_cards = last_column_cards

        # construct and send patch request
        cards = [{
            'id': first_card.id,
            'task': 'column 1 card 1',
            'position_id': last_column_cards,
            'column_id': last_column.id
        }]
        data = {'cards': cards}
        url = reverse('api:cards_create_update')
        response = self.client.patch(url, data, format='json')

        # refresh db data
        first_card.refresh_from_db()
        first_column_cards = Card.objects.filter(
            column_id=first_column.id).count()
        last_column_cards = Card.objects.filter(
            column_id=last_column.id).count()

        # assert that the card has moved to the last column
        self.assertEqual(first_card.column_id, last_column.id)
        self.assertEqual(first_column_cards, num_first_column_cards - 1)
        self.assertEqual(last_column_cards, num_last_column_cards + 1)

    def test_delete_card_and_update_remaining_position_ids(self):
        column = Column.objects.first()
        first_card = Card.objects.get(column_id=column.id, position_id=0)
        second_card = Card.objects.get(column_id=column.id, position_id=1)
        third_card = Card.objects.get(column_id=column.id, position_id=2)
        num_cards = Card.objects.filter(column_id=column.id).count()

        cards = [{
            'id': first_card.id,
            'task': 'column 1 card 1',
            'position_id': 0,
            'column_id': column.id,
            'delete': 'true'
        }, {
            'id': second_card.id,
            'task': 'column 1 card 2',
            'position_id': 0,
            'column_id': column.id
        }, {
            'id': third_card.id,
            'task': 'column 1 card 3',
            'position_id': 1,
            'column_id': column.id
        }]
        data = {'cards': cards}

        url = reverse('api:cards_create_update')
        response = self.client.patch(url, data, format='json')

        first_card = Card.objects.get(column_id=column.id, position_id=0)
        second_card = Card.objects.get(column_id=column.id, position_id=1)

        self.assertEqual(num_cards - 1,
                         Card.objects.filter(column_id=column.id).count())
        self.assertEqual(first_card.task, 'column 1 card 2')
        self.assertEqual(second_card.task, 'column 1 card 3')
