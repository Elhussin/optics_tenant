import hashlib

def generate_sku_code(instance):
    """Generates a human-readable and unique SKU code for a variant or product."""
    
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
        if product.type in ['EW', 'SG'] and hasattr(variant, '_eyewear_fields'):
            fields += variant._eyewear_fields()
        elif product.type in ['SL', 'CL'] and hasattr(variant, '_lenses_fields'):
            fields += variant._lenses_fields()
    
    # Fallback or specific types
    if product.type in ['AX', 'DV', 'OT'] or not variant:
        fields += [str(product.type), str(product.model or '')]

    # Join all fields to create a base string
    base_string = "-".join(fields)
    hash_value = hashlib.sha256(base_string.encode()).hexdigest()[:8].upper()

    # Human Readable Part
    type_code = product.type
    
    # Get Brand Name safely
    brand_name = 'XX'
    try:
        if product.brand:
            brand_name = product.brand.name
    except:
        pass # Handle cases where brand is not set or accessible

    brand_code = brand_name[:2].upper()
    model_code = (product.model or '')[:4].upper()
    
    prefix = "P" if not variant else "V"
    return f"{prefix}-{type_code}-{brand_code}-{model_code}-{hash_value}"
