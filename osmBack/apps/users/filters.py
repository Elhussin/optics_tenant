# filters.py

import django_filters
from .models import User
from rest_framework.views import APIView
from rest_framework.response import Response

# class UserFilter(django_filters.FilterSet):
#     username = django_filters.CharFilter(lookup_expr="icontains")
#     phone = django_filters.CharFilter(lookup_expr="icontains")
#     email = django_filters.CharFilter(lookup_expr="icontains")
#     role_id = django_filters.CharFilter(lookup_expr="icontains")

#     class Meta:
#         model = User
#         fields = ['username', 'phone', 'email', 'role_id']




# class UserFilterOptionsView(APIView):
#     def get(self, request):
#         roles = User.objects.values_list('role_id', flat=True).distinct()
#         emails = User.objects.values_list('email', flat=True).distinct()
#         phones = User.objects.values_list('phone', flat=True).distinct()
#         usernames = User.objects.values_list('username', flat=True).distinct()

#         return Response({
#             'roles': list(filter(None, roles)),  # Remove None values
#             'emails': list(filter(None, emails)),
#             'phones': list(filter(None, phones)),
#             'usernames': list(filter(None, usernames)),
#         })



from core.utils.filters_utils import FilterOptionsGenerator, create_filterset_class,get_display_name
USER_RELATED_FIELDS = [
    "role_id__name",
    "email",
    "phone",
    "username",
    "first_name",
    "last_name",
]
# # 👇 أسماء مخصصة لبعض الحقول
USER_FIELD_LABELS = {
    "role_id__name": "Role",
    "email": "Email",
    "phone": "Phone",
    "username": "Username",
    "first_name": "First Name",
    "last_name": "Last Name",

}

# 👇 تعريف الحقول للفلترة الدقيقة
filter_fields = {
    "role_id__name": ["icontains"],
    "email": ["icontains"],
    "phone": ["icontains"],
    "username": ["icontains"],
    "first_name": ["icontains"],
    "last_name": ["icontains"],
}

UserFilter = create_filterset_class(User, filter_fields)
