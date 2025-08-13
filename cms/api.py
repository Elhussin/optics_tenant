from wagtail.api.v2.views import PagesAPIViewSet

class PublicPagesAPIViewSet(PagesAPIViewSet):
    authentication_classes = []  # بدون توثيق
    permission_classes = []      # بدون قيود

    def get_queryset(self):
        
        qs = super().get_queryset()
        return qs.filter(live=True)  # فقط الصفحات المنشورة
