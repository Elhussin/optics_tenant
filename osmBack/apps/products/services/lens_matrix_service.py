from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.products.models import Product, StokLensVariant, ContactLensVariant, AttributeValue


def format_lens_power(val: float, is_spherical: bool = True) -> str:
    """Formats lens power to match Django choices like '-01.00' or '+00.50' or '-00.25'"""
    abs_val = abs(val)
    if is_spherical:
        sign = "+" if val >= 0 else "-"
        return f"{sign}{abs_val:05.2f}"
    else:
        # Cylinder powers are negative/zero
        return f"-{abs_val:05.2f}"


def generate_power_range(start: float, end: float, step: float, is_spherical: bool = True):
    """Generates a formatted list of lens power strings matching model choices"""
    if step == 0:
        return [format_lens_power(start, is_spherical)]
    
    if start < end and step < 0:
        step = abs(step)
    elif start > end and step > 0:
        step = -abs(step)

    powers = []
    curr = start
    epsilon = 0.0001
    while (step > 0 and curr <= end + epsilon) or (step < 0 and curr >= end - epsilon):
        powers.append(format_lens_power(curr, is_spherical))
        curr += step

    return powers


def generate_lens_matrix(
    product_id: int,
    sph_start: float,
    sph_end: float,
    sph_step: float = -0.25,
    cyl_start: float = 0.0,
    cyl_end: float = 0.0,
    cyl_step: float = -0.25,
    lens_diameter_id: int = None,
    lens_material_id: int = None,
    lens_color_id: int = None,
    product_type_id: int = None,
    selling_price: Decimal = Decimal('0.00'),
    min_selling_price: Decimal = None,
    variant_type: str = 'stockLenses'
):
    """
    Bulk generates SPH x CYL lens variants for a Product while preventing duplicate powers.
    """
    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        raise ValidationError(_("Product with ID {0} does not exist.").format(product_id))

    sph_list = generate_power_range(sph_start, sph_end, sph_step, is_spherical=True)
    cyl_list = generate_power_range(cyl_start, cyl_end, cyl_step, is_spherical=False) if (cyl_start or cyl_end or cyl_step) else [""]

    model_class = ContactLensVariant if variant_type == 'contactLenses' else StokLensVariant

    # Fetch existing powers for duplicate prevention
    existing_powers = set(
        model_class.objects.filter(product=product).values_list('spherical', 'cylinder')
    )

    created_variants = []
    skipped_count = 0

    with transaction.atomic():
        for sph in sph_list:
            for cyl in cyl_list:
                cyl_val = cyl if cyl else None
                if (sph, cyl_val) in existing_powers or (sph, cyl) in existing_powers:
                    skipped_count += 1
                    continue

                variant = model_class(
                    product=product,
                    spherical=sph,
                    cylinder=cyl_val,
                    selling_price=selling_price,
                    min_selling_price=min_selling_price,
                )

                if product_type_id:
                    variant.product_type_id = product_type_id
                if lens_diameter_id:
                    variant.lens_diameter_id = lens_diameter_id
                if lens_material_id:
                    variant.lens_material_id = lens_material_id
                if lens_color_id:
                    variant.lens_color_id = lens_color_id

                variant.save()
                created_variants.append(variant)
                existing_powers.add((sph, cyl_val))

    return {
        "created_count": len(created_variants),
        "skipped_duplicates_count": skipped_count,
        "created_skus": [v.sku for v in created_variants]
    }
