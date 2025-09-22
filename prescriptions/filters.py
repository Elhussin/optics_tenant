# filters.py
import django_filters
from .models import PrescriptionRecord

class PrescriptionRecordFilter(django_filters.FilterSet):
    class Meta:
        model = PrescriptionRecord
        fields = {
            "customer__id": ["exact"],
            "customer__phone": ["icontains"],
            "created_by__username": ["icontains"],
            "created_by__id": ["exact"],

            # "customer__phone": ["exact", "icontains"],
            # "created_by__username": ["exact", "icontains"],
            # "created_by__first_name": ["exact", "icontains"],
            # "created_by__last_name": ["exact", "icontains"],
     
     
        }



# class UserFilter(django_filters.FilterSet):
#     username = django_filters.CharFilter(lookup_expr="icontains")
#     phone = django_filters.CharFilter(lookup_expr="icontains")
#     email = django_filters.CharFilter(lookup_expr="icontains")
#     role = django_filters.CharFilter(lookup_expr="icontains")

#     class Meta:
#         model = User
#         fields = ['username', 'phone', 'email', 'role']




# class UserFilterOptionsView(APIView):
#     def get(self, request):
#         roles = User.objects.values_list('role', flat=True).distinct()
#         emails = User.objects.values_list('email', flat=True).distinct()
#         phones = User.objects.values_list('phone', flat=True).distinct()
#         usernames = User.objects.values_list('username', flat=True).distinct()

#         return Response({
#             'roles': list(filter(None, roles)),  # Remove None values
#             'emails': list(filter(None, emails)),
#             'phones': list(filter(None, phones)),
#             'usernames': list(filter(None, usernames)),
#         })
