from wagtail.models import Page
from django.http import JsonResponse

def page_detail(request, slug):
    try:
        page = Page.objects.get(slug=slug).specific
        return JsonResponse({
            "title": page.title,
            "body": getattr(page, "body", ""),
        })
    except Page.DoesNotExist:
        return JsonResponse({"error": "Page not found"}, status=404)
