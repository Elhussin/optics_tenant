# filters.py

import django_filters
from .models import User
from rest_framework.views import APIView
from rest_framework.response import Response



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
