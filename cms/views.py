from wagtail.models import Page
from django.http import JsonResponse
# cms/api.py
from wagtail.api.v2.views import PagesAPIViewSet
from rest_framework.permissions import AllowAny

class PublicPagesAPIViewSet(PagesAPIViewSet):
    permission_classes = [AllowAny]

def page_detail(request, slug):
    permission_classes = [AllowAny]
    try:
        page = Page.objects.get(slug=slug).specific
        return JsonResponse({
            "title": page.title,
            "body": getattr(page, "body", ""),
        })
    except Page.DoesNotExist:
        return JsonResponse({"error": "Page not found"}, status=404)
