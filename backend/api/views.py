from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from .models import Item
from .serializers import ItemSerializer


@api_view(["GET"])
def health(request):
    """서버 상태 확인용 API"""
    return Response({"status": "ok"})


class ItemList(APIView):
    """아이템 목록 조회 및 추가"""
    def get(self, request):
        items = Item.objects.all().order_by("id")
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)
