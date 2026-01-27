from rest_framework.pagination import PageNumberPagination


class FlexiblePagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'

    # max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        if request.query_params.get('all') == 'true':
            return None  # Ignore pagination and return all elements
        return super().paginate_queryset(queryset, request, view)
