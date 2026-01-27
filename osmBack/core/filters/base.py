# filters/base.py
import django_filters
from django.db import models


class DynamicCharFilter(django_filters.CharFilter):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault('lookup_expr', 'icontains')
        super().__init__(*args, **kwargs)


class BaseFilterSet(django_filters.FilterSet):
    """
    Reusable FilterSet for basic filters like CharField etc.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        for field_name, filter_ in self.filters.items():
            # Add dynamic choices if the filter field is a ChoiceField
            # WARNING: This executes a DB query for every request if used on large tables.
            # Consider removing this or using caching.
            if isinstance(filter_.field, django_filters.fields.ChoiceField):
                model = self._meta.model
                # Check if field exists in model
                try:
                    field = model._meta.get_field(field_name)
                    if isinstance(field, (models.CharField, models.TextField)):
                        # CAUTION: High performance cost on large datasets
                        choices = model.objects.values_list(
                            field_name, flat=True).distinct()
                        filter_.extra['choices'] = [
                            (v, v) for v in choices if v]
                except Exception:
                    # Field might not exist on model (e.g. method field)
                    pass
