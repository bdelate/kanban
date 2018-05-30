from django.contrib import admin
from .models import Board, Column, Card


class BoardAdmin(admin.ModelAdmin):
    list_display = ('name', 'user')


class ColumnAdmin(admin.ModelAdmin):
    list_display = ('name', 'board', 'id', 'position_id')


class CardAdmin(admin.ModelAdmin):
    list_display = ('column', 'task', 'position_id', 'id')


admin.site.register(Board, BoardAdmin)
admin.site.register(Column, ColumnAdmin)
admin.site.register(Card, CardAdmin)
