from django.contrib.auth import get_user_model
from api.models import Board, Column, Card


class TestDataMixin:

    def create_test_data():
        User = get_user_model()
        credentials = {'username': 'john', 'password': 'p@ssw0rd'}
        user = User.objects.create_user(**credentials)

        board = Board.objects.create(user=user, name='test board')

        c1 = Column.objects.create(board=board,
                                   name='first column',
                                   position_id=0)
        Card.objects.create(column=c1, task="column 1 card 1", position_id=0)
        Card.objects.create(column=c1, task="column 1 card 2", position_id=1)
        Card.objects.create(column=c1, task="column 1 card 3", position_id=2)

        c2 = Column.objects.create(board=board,
                                   name='second column',
                                   position_id=1)
        Card.objects.create(column=c2, task="column 2 card 1", position_id=0)
        Card.objects.create(column=c2, task="column 2 card 2", position_id=1)
        Card.objects.create(column=c2, task="column 2 card 3", position_id=2)

        c3 = Column.objects.create(board=board,
                                   name='third column',
                                   position_id=2)
