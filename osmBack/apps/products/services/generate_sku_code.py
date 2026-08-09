import logging
import re

logger = logging.getLogger(__name__)


def _clean_str(val: str, max_len: int = 6) -> str:
    if not val:
        return ""
    cleaned = re.sub(r'[^A-Za-z0-9]', '', str(val)).upper()
    return cleaned[:max_len]


def _format_power(power_val) -> str:
    """Formats lens power float/str into a compact string like N0200 or P0200"""
    if power_val is None or str(power_val).strip() == "":
        return "000"
    s = str(power_val).strip()
    try:
        val = float(s)
        prefix = "P" if val >= 0 else "N"
        abs_val = int(round(abs(val) * 100))
        return f"{prefix}{abs_val:03d}"
    except (ValueError, TypeError):
        return _clean_str(s, 6)


def generate_sku_code(instance) -> str:
    """
    Generates a structured, human-readable SKU code.
    Examples:
      - Frames: FR-RB-3025-C001-58
      - Stock Lenses: SL-HOY-161-SN0200-CN0100
      - Contact Lenses: CL-ACU-OASIS-SN0325-BC86
    """
    if hasattr(instance, 'product'):
        product = instance.product
        variant = instance
    else:
        product = instance
        variant = None

    group_code = _clean_str(getattr(product, 'main_group', 'OT') or 'OT', 3)
    brand_code = 'GEN'
    try:
        if product and product.brand:
            brand_code = _clean_str(product.brand.name, 4)
    except Exception:
        pass

    model_code = _clean_str(getattr(product, 'model', '') or 'MOD', 6)

    parts = [group_code, brand_code, model_code]

    if variant:
        # Check specific variant attributes
        if hasattr(variant, 'frame_color') and variant.frame_color:
            color_val = _clean_str(getattr(variant.frame_color, 'value', str(variant.frame_color)), 4)
            parts.append(color_val)
        if hasattr(variant, 'lens_diameter') and variant.lens_diameter:
            dia_val = _clean_str(getattr(variant.lens_diameter, 'value', str(variant.lens_diameter)), 3)
            parts.append(dia_val)

        # Lens powers
        if hasattr(variant, 'spherical') and variant.spherical is not None:
            parts.append(f"S{_format_power(variant.spherical)}")
        if hasattr(variant, 'cylinder') and variant.cylinder is not None and str(variant.cylinder).strip():
            parts.append(f"C{_format_power(variant.cylinder)}")
        if hasattr(variant, 'lens_base_curve') and variant.lens_base_curve:
            bc_val = _clean_str(getattr(variant.lens_base_curve, 'value', str(variant.lens_base_curve)), 4)
            parts.append(f"BC{bc_val}")

    prefix = "P" if not variant else "V"
    base_sku = "-".join([p for p in parts if p])
    full_sku = f"{prefix}-{base_sku}"

    # Check for existing SKU collision if instance model is available
    model_cls = instance.__class__
    if hasattr(model_cls, 'objects'):
        qs = model_cls.objects.filter(sku=full_sku)
        if instance.pk:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            suffix = f"-{instance.pk}" if instance.pk else "-1"
            full_sku = f"{full_sku}{suffix}"

    return full_sku


def generate_numeric_barcode(instance) -> str:
    """
    Generates a 12-13 digit numeric barcode suitable for EAN13/Code128 POS scanners.
    Prefix 200 is used for internal store barcodes.
    """
    prefix = "200"
    pk_str = str(instance.pk or '0')
    if len(pk_str) > 8:
        pk_str = pk_str[-8:]
    padded_id = pk_str.zfill(8)
    
    raw_11 = f"{prefix}{padded_id}"
    checksum = sum(int(d) for d in raw_11) % 10
    return f"{raw_11}{checksum}"
