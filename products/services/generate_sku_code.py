import hashlib

def generate_sku_code(variant):
    """Generates a human-readable and unique SKU code for a variant."""
    product = variant.product
    fields = [str(product.id or '')]

    if product.type in ['EW', 'SG']:
        fields += variant._eyewear_fields()
    elif product.type in ['SL', 'CL']:
        fields += variant._lenses_fields()
    elif product.type in ['AX', 'DV', 'OT']:
        fields += [str(product.type), str(product.model or '')]

    # Join all fields to create a base string
    base_string = "-".join(fields)
    hash_value = hashlib.sha256(base_string.encode()).hexdigest()[:6].upper()  # أول 6 حروف فقط

    # بناء الكود البشري المقروء
    type_code = product.type
    brand_code = product.brand[:2].upper() if product.brand else 'XX'
    model_code = (product.model or '')[:4].upper()
    
    return f"{type_code}-{brand_code}-{model_code}-{hash_value}"
