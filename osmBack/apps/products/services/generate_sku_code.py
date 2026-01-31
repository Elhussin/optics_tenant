import hashlib
import logging

logger = logging.getLogger(__name__)


def generate_sku_code(instance):
    """
    Generates a human-readable and unique SKU code for a variant or product.
    Format: [P/V]-[Type]-[Brand]-[Model]-[Hash]
    Example: V-SG-RB-AVIA-A1B2C3D4
    """

    # Determine if instance is Product or Variant
    if hasattr(instance, 'product'):
        product = instance.product
        variant = instance
    else:
        product = instance
        variant = None

    fields = [str(product.id or '')]

    # Add variant specific fields to hash if available
    if variant:
        if product.main_group in ['EW', 'SG'] and hasattr(variant, '_eyewear_fields'):
            fields += variant._eyewear_fields()
        elif product.main_group in ['SL', 'CL'] and hasattr(variant, '_lenses_fields'):
            fields += variant._lenses_fields()

    # Fallback or specific types
    if product.main_group in ['AX', 'DV', 'OT'] or not variant:
        fields += [str(product.main_group), str(product.model or '')]

    # Join all fields to create a base string
    base_string = "-".join([str(f).strip() for f in fields])
    hash_value = hashlib.sha256(base_string.encode()).hexdigest()[:8].upper()

    # Human Readable Part
    type_code = product.main_group

    # Get Brand Name safely
    brand_name = 'XX'
    try:
        if product.brand:
            brand_name = product.brand.name
    except Exception as e:
        logger.warning(f"Error accessing brand for SKU generation: {e}")

    brand_code = brand_name.strip()[:2].upper()
    model_code = (product.model or '').strip()[:4].upper()

    prefix = "P" if not variant else "V"
    return f"{prefix}-{type_code}-{brand_code}-{model_code}-{hash_value}"
