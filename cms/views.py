from wagtail.models import Page
from django.http import JsonResponse
# cms/api.py
from wagtail.api.v2.views import PagesAPIViewSet
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework import serializers

class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = ['title', 'body', 'intro']

class PublicPagesAPIViewSet(PagesAPIViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'])
    def by_slug(self, request):
        slug = request.query_params.get('slug')
        if not slug:
            return Response({"error": "Missing slug"}, status=400)

        page = self.get_queryset().filter(slug=slug).first()
        if not page:
            return Response({"error": "Page not found"}, status=404)

        serializer_class = self.get_serializer_class()
        serializer = serializer_class(page, context=self.get_serializer_context())
        print("serializer", serializer)
        return Response(serializer.data)


# class PageBySlugAPIView(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request):
#         slug = request.query_params.get("slug")
#         if not slug:
#             return Response({"error": "Missing slug"}, status=400)

#         page = Page.objects.live().filter(slug=slug).specific().first()
#         if not page:
#             return Response({"error": "Page not found"}, status=404)

#         serializer = PageSerializer(page)
#         return Response(serializer.data)



def page_detail(request, slug):
    try:
        page = Page.objects.get(slug=slug).specific
        data = {
            "title": page.title,
        }
        if hasattr(page, "body"):
            data["body"] = page.body
        if hasattr(page, "intro"):
            data["intro"] = page.intro
        return JsonResponse(data)
    except Page.DoesNotExist:
        return JsonResponse({"error": "Page not found"}, status=404)
