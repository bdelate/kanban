from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from .mixins import TestDataMixin


class BoardDetailTest(TestCase, TestDataMixin):

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
