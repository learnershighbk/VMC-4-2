from django.db import models

# Create your models here.

class Item(models.Model):
    name = models.CharField(max_length=100)
    note = models.TextField(blank=True, default="")

    def __str__(self):
        return self.name

from rest_framework import serializers
from .models import Item

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ["id", "name", "note"]



