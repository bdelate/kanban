from django.db import models
from django.conf import settings


class Board(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    def __str__(self):
        return '{0}: {1}'.format(self.user, self.name)


class Column(models.Model):
    board = models.ForeignKey(to=Board,
                              on_delete=models.CASCADE,
                              related_name='columns')
    name = models.CharField(max_length=100)
    position_id = models.IntegerField()

    class Meta:

        unique_together = ('board', 'position_id')
        ordering = ['position_id']

    def __str__(self):
        return self.name


class Card(models.Model):
    column = models.ForeignKey(to=Column,
                               on_delete=models.CASCADE,
                               related_name='cards')
    task = models.TextField()
    position_id = models.IntegerField()

    class Meta:

        ordering = ['position_id']

    def __str__(self):
        task_str = '{}'.format(self.task)[:15]
        return '{}...'.format(task_str)
