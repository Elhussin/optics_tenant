# core/utils/options_builder.py

def build_choices_from_queryset(queryset, label_field="name", value_field="id"):
    """
    Builds choices from any Queryset in the format [{"label": ..., "value": ...}]
    """
    return [
        {
            "label": getattr(obj, label_field),
            "value": getattr(obj, value_field)
        }
        for obj in queryset
    ]


def build_choices_from_list(choices):
    """
    Builds choices from a list of choices [(value, label), ...]
    """
    return [
        {"label": label, "value": value}
        for value, label in choices
    ]
