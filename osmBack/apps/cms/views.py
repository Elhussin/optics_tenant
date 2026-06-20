from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from core.views import BaseViewSet
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired
from .models import Page, ContactUs
from .serializers import PageSerializer, ContactUsSerializer

class ContactUsViewSet(BaseViewSet):
    permission_classes = [AllowAny]
    queryset = ContactUs.objects.all()
    serializer_class = ContactUsSerializer

class PublicPageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    For public pages only
    """
    queryset = Page.objects.filter(is_published=True, is_deleted=False)
    serializer_class = PageSerializer
    lookup_field = "slug"
    permission_classes = [AllowAny]

class PageViewSet(BaseViewSet):
    queryset = Page.objects.all()
    serializer_class = PageSerializer

    def get_permissions(self):
        """
        Allow authenticated users to view/list pages.
        Only admin/owner can create/update/delete.
        """
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [
            IsAuthenticated(),
            RoleOrPermissionRequired.with_requirements()
        ]

    def update(self, request, *args, **kwargs):
        data = request.data
        # Standard model serializer update is robust enough
        return super().update(request, *args, **kwargs)
