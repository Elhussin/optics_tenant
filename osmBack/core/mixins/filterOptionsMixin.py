from django_filters import rest_framework as filters
from core.utils.filters_utils import FilterOptionsGenerator, get_display_name
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import FilterSet
from core.utils.filters_utils import create_filterset_class
# ----------------------------
# FilterOptionsMixin مرن
# ----------------------------
class FilterOptionsMixin:
    filterset_class = None
    search_fields = []
    field_labels = {}
    filter_fields = {}
    # relatedClass = None
    FilterSet = create_filterset_class(filterset_class, filter_fields)


    @action(detail=False, methods=["get"])
    def filter_options(self, request):
        if not hasattr(self, "queryset") or self.queryset is None:
            return Response([])

        generator = FilterOptionsGenerator(
            queryset=self.get_queryset(),
            filterset_class=self.FilterSet,
            query_params=request.query_params,
        )
        options = generator.generate_options(getattr(self, "search_fields", []))
        formatted_options = [
            {
                "name": field,
                "label": get_display_name(getattr(self, "field_labels", {}), field),
                "values": values,
            }
            for field, values in options.items()
        ]
        return Response(formatted_options)