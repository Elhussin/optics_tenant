"""
Product Constants - Centralized choices and constants for products module.

This file contains all product-related choices and constants in one place
for easy modification and extension.

Usage:
    from apps.products.constants import PRODUCT_TYPE_CHOICES, VARIANT_TYPE_CHOICES
"""
from django.utils.translation import gettext_lazy as _

# =============================================================================
# MAIN PRODUCT TYPE
# =============================================================================
# These are the main categories of products in an optical store
PRODUCT_TYPE_CHOICES = [
    ('CL', _('Contact Lenses')),      # Contact Lenses
    ('SL', _('Spectacle Lenses')),    # Spectacle Lenses
    ('FR', _('Frames')),              # Frames
    ('AX', _('Accessories')),         # Accessories
    ('OT', _('Other')),               # Other
    ('DV', _('Devices')),             # Devices
]



# Dictionary for quick lookup by code
PRODUCT_TYPE_DICT = {code: label for code, label in PRODUCT_TYPE_CHOICES}


# =============================================================================
# VARIANT TYPE
# =============================================================================
# These define which model/serializer to use for variants
VARIANT_TYPE_CHOICES = [
    ('basic', _('Basic')),                # Basic variant
    ('frames', _('Frames')),              # Frames
    ('stockLenses', _('Stock Lenses')),   # Stock Lenses
    ('rxLenses', _('Rx Lenses')),         # Rx Lenses
    ('contactLenses', _('Contact Lenses')),  # Contact Lenses
    ('custom', _('Custom')),              # Custom
]

# Dictionary for quick lookup by code
VARIANT_TYPE_DICT = {code: label for code, label in VARIANT_TYPE_CHOICES}


# =============================================================================
# MAPPING: Product Type → Allowed Variant Types
# =============================================================================
# This defines which variant types are valid for each product type
PRODUCT_VARIANT_TYPE_MAPPING = {
    'CL': ['basic', 'contactLenses', 'custom'],
    'SL': ['basic', 'stockLenses', 'rxLenses', 'custom'],
    'FR': ['basic', 'frames', 'custom'],
    'AX': ['basic', 'custom'],
    'OT': ['basic', 'custom'],
    'DV': ['basic', 'custom'],
}


# =============================================================================
# RIGHT/LEFT EYE CHOICES
# =============================================================================
RIGHT_LEFT_CHOICES = [
    ('R', _('Right')),  # Right
    ('L', _('Left')),   # Left
]


# =============================================================================
# TAX CATEGORY CHOICES
# =============================================================================
TAX_CATEGORY_CHOICES = [
    ('standard', _('Standard (15%)')),
    ('zero_rated', _('Zero-Rated (0% Medical)')),
    ('exempt', _('Exempt')),
]



# =============================================================================
# HELPER FUNCTIONS
# =============================================================================
def get_product_type_label(code: str) -> str:
    """Get the display label for a product type code."""
    return PRODUCT_TYPE_DICT.get(code, 'Unknown')


def get_variant_type_label(code: str) -> str:
    """Get the display label for a variant type code."""
    return VARIANT_TYPE_DICT.get(code, 'Unknown')


def get_allowed_variant_types(product_type: str) -> list:
    """Get the allowed variant types for a given product type."""
    return PRODUCT_VARIANT_TYPE_MAPPING.get(product_type, ['basic', 'custom'])


def is_valid_variant_type(product_type: str, variant_type: str) -> bool:
    """Check if a variant type is valid for a given product type."""
    allowed = get_allowed_variant_types(product_type)
    return variant_type in allowed
