from decimal import Decimal
from django.utils.translation import gettext_lazy as _

class PrescriptionAnalyzerService:
    @staticmethod
    def suggest_lenses_for_prescription(sph_r, sph_l, cyl_r=0, cyl_l=0):
        """
        Analyzes optical values of a prescription (Sphere, Cylinder) to recommend
        appropriate lens materials, index indexes, and coatings.
        """
        # Convert values safely
        try:
            sph_r_val = abs(float(sph_r or 0))
            sph_l_val = abs(float(sph_l or 0))
            cyl_r_val = abs(float(cyl_r or 0))
            cyl_l_val = abs(float(cyl_l or 0))
        except (ValueError, TypeError):
            sph_r_val = sph_l_val = cyl_r_val = cyl_l_val = 0.0

        max_sph = max(sph_r_val, sph_l_val)
        max_cyl = max(cyl_r_val, cyl_l_val)

        # 1. Lens Index Suggestion
        if max_sph > 6.00:
            lens_index = "1.74 (Ultra Thin)"
            material = _("High Index Plastic")
        elif max_sph > 4.00:
            lens_index = "1.67 (Very Thin)"
            material = _("High Index Plastic")
        elif max_sph > 2.00:
            lens_index = "1.61 (Thin)"
            material = _("Polycarbonate or MR-8")
        else:
            lens_index = "1.56 (Standard)"
            material = _("CR-39 Standard Plastic")

        # 2. Specialized Treatments
        treatments = []
        if max_cyl > 2.00:
            treatments.append(str(_("Aspheric design for astigmatism correction")))
        
        # Add basic coatings suggestions
        treatments.append(str(_("Anti-Reflective (AR) Coating")))
        if max_sph > 3.00 or max_cyl > 1.50:
            treatments.append(str(_("Scratch-Resistant Hard Coating")))
        
        return {
            'recommended_index': lens_index,
            'recommended_material': material,
            'suggested_coatings_and_treatments': treatments,
            'uv_protection_recommended': True if max_sph > 2.00 or material == "Polycarbonate" else False,
            'notes': str(_("High prescriptions benefit from thinner lens indices to improve visual aesthetics and reduce distortion."))
        }
