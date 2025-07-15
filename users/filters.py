# filters.py

import django_filters
from .models import User

class UserFilter(django_filters.FilterSet):
    username = django_filters.CharFilter(lookup_expr="icontains")
    phone = django_filters.CharFilter(lookup_expr="icontains")
    email = django_filters.CharFilter(lookup_expr="icontains")
    role = django_filters.CharFilter(lookup_expr="icontains")

    class Meta:
        model = User
        fields = ['username', 'phone', 'email', 'role']



from rest_framework.views import APIView
from rest_framework.response import Response
from .models import User

class UserFilterOptionsView(APIView):
    def get(self, request):
        roles = User.objects.values_list('role', flat=True).distinct()
        emails = User.objects.values_list('email', flat=True).distinct()
        phones = User.objects.values_list('phone', flat=True).distinct()
        usernames = User.objects.values_list('username', flat=True).distinct()

        return Response({
            'roles': list(filter(None, roles)),  # Remove None values
            'emails': list(filter(None, emails)),
            'phones': list(filter(None, phones)),
            'usernames': list(filter(None, usernames)),
        })
