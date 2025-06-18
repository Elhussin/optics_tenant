from django.shortcuts import render
from rest_framework import viewsets
from .serializers import *
from .models import *


class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer


class BranchUsersViewSet(viewsets.ModelViewSet):
    queryset = BranchUsers.objects.all()
    serializer_class = BranchUsersSerializer




# Create your views here.
