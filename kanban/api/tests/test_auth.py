from rest_framework.test import APITestCase
from rest_framework_jwt.settings import api_settings
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from .mixins import TestDataMixin

from api.models import Board, Card, Column


class SignUpTest(APITestCase):

    def setUp(self):
        self.jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        self.jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

    def test_create_user_success(self):
        data = {
            'username': 'newuser',
            'password': 'p@ssw0rd'
        }

        url = reverse('api:signup')
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = get_user_model().objects.filter(username='newuser').count()
        self.assertEqual(user, 1)

    def test_create_user_failure(self):
        data = {
            'username': 'newuser'
        }

        url = reverse('api:signup')
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        user = get_user_model().objects.filter(username='newuser').count()
        self.assertEqual(user, 0)


class BoardAuthTest(APITestCase, TestDataMixin):

    @classmethod
    def setUpTestData(cls):

        cls.create_test_data()

    def setUp(self):
        self.jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        self.jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

    def test_list_unauth_user_fails(self):
        url = reverse('api:board_list_create')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_unauth_user_fails(self):
        data = {'name': 'new board'}
        url = reverse('api:board_list_create')
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_detail(self):
        board = Board.objects.first()
        url = reverse('api:board_detail', args=[board.id])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        user = get_user_model().objects.get(username='john')
        payload = self.jwt_payload_handler(user)
        token = self.jwt_encode_handler(payload)
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + token)

        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_unauth_user_fails(self):
        board = Board.objects.first()
        num_boards = Board.objects.count()
        url = reverse('api:board_detail', args=[board.id])
        response = self.client.delete(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(num_boards, Board.objects.count())


class ColumnAuthTest(APITestCase, TestDataMixin):

    @classmethod
    def setUpTestData(cls):

        cls.create_test_data()

    def setUp(self):
        self.jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        self.jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
        user = get_user_model().objects.get(username='john')
        payload = self.jwt_payload_handler(user)
        self.token = self.jwt_encode_handler(payload)

    def test_detail(self):
        column = Column.objects.first()

        url = reverse('api:column_detail', args=[column.id])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create(self):
        board = Board.objects.first()
        columns = Column.objects.filter(board_id=board.id).count()
        data = {
            'id': -1,
            'spinner': 'true',
            'name': 'new column',
            'position_id': columns,
            'board_id': 100,
            'cards': []
        }

        # no token included in header
        url = reverse('api:columns_create_update')
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        # invalid board_id
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # valid data
        data['board_id'] = board.id
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_update(self):
        first_column = Column.objects.first()
        last_column = Column.objects.last()
        columns = [{
            'id': first_column.id,
            'cards': [],
            'board_id': first_column.board_id,
            'name': first_column.name,
            'position_id': 0
        }, {
            'id': last_column.id,
            'cards': [],
            'board_id': last_column.board_id,
            'name': last_column.name,
            'position_id': 2
        }]
        data = {'columns': columns}

        # no token included in header
        url = reverse('api:columns_create_update')
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        # invalid data
        response = self.client.patch(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # valid data
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class CardAuthTest(APITestCase, TestDataMixin):

    @classmethod
    def setUpTestData(cls):

        cls.create_test_data()

    def setUp(self):
        self.jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        self.jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
        user = get_user_model().objects.get(username='john')
        payload = self.jwt_payload_handler(user)
        self.token = self.jwt_encode_handler(payload)

    def test_detail(self):
        card = Card.objects.first()

        url = reverse('api:card_detail', args=[card.id])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create(self):
        column = Column.objects.first()
        data = {
            'id': -1,
            'spinner': 'true',
            'task': 'newly created test task',
            'column_id': -1,
            'position_id': Column.objects.count()
        }

        # no token included in header
        url = reverse('api:cards_create_update')
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        # invalid columm_id
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # valid data
        data['column_id'] = column.id
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_update(self):
        first_card = Card.objects.first()
        last_card = Card.objects.last()
        cards = [{
            'id': first_card.id,
            'task': 'column 1 card 3',
            'position_id': 0,
            'column_id': first_card.column_id
        }, {
            'id': last_card.id,
            'task': 'column 1 card 1',
            'position_id': 2,
            'column_id': last_card.column_id
        }]
        data = {'cards': cards}

        # no token included in header
        url = reverse('api:cards_create_update')
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        # invalid data
        response = self.client.patch(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # valid data
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
