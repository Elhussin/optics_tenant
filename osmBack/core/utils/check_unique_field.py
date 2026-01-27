"""
Helper functions to validate data uniqueness
"""

from core.exceptions import validate_unique_field


def check_unique_field(model, field_name, value, instance=None, lang='ar'):
    """
    Validate field uniqueness with localization support.
    verify field uniqueness

    This function is a wrapper for validate_unique_field from core.exceptions
    to maintain backward compatibility with legacy code.

    Args:
        model: The model to check
        field_name: Name of the field
        value: Value to check
        instance: Current instance (for updates)
        lang: Language code (ar/en)

    Returns:
        value: The value if unique

    Raises:
        ValidationError: If value is duplicate
    """
    return validate_unique_field(model, field_name, value, instance)
