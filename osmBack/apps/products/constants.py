"""
Product Constants - Centralized choices and constants for products module.

This file contains all product-related choices and constants in one place
for easy modification and extension.

Usage:
    from apps.products.constants import PRODUCT_TYPE_CHOICES, VARIANT_TYPE_CHOICES
"""

# =============================================================================
# MAIN PRODUCT TYPE (تصنيف المنتج الرئيسي)
# =============================================================================
# These are the main categories of products in an optical store
PRODUCT_TYPE_CHOICES = [
    ('CL', 'Contact Lenses'),      # عدسات لاصقة
    ('SL', 'Spectacle Lenses'),    # عدسات نظارات
    ('FR', 'Frames'),              # إطارات
    ('AX', 'Accessories'),         # إكسسوارات
    ('OT', 'Other'),               # أخرى
    ('DV', 'Devices'),             # أجهزة
]



# Dictionary for quick lookup by code
PRODUCT_TYPE_DICT = {code: label for code, label in PRODUCT_TYPE_CHOICES}


# =============================================================================
# VARIANT TYPE (نوع المتغير)
# =============================================================================
# These define which model/serializer to use for variants
VARIANT_TYPE_CHOICES = [
    ('basic', 'Basic'),                # متغير أساسي
    ('frames', 'Frames'),              # إطارات
    ('stockLenses', 'Stock Lenses'),   # عدسات جاهزة
    ('rxLenses', 'Rx Lenses'),         # عدسات طبية
    ('contactLenses', 'Contact Lenses'),  # عدسات لاصقة
    ('custom', 'Custom'),              # مخصص
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
# RIGHT/LEFT EYE CHOICES (اختيارات العين)
# =============================================================================
RIGHT_LEFT_CHOICES = [
    ('R', 'Right'),  # يمين
    ('L', 'Left'),   # يسار
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
