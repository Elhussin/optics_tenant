// // eyeTestValidator.ts

export class EyeTestValidator {
  isMultipleOfQuarter(value: number): boolean {
    return Math.round(value * 100) % 25 === 0;
  }
  formatPower(value: number): string {
    const fixed = Math.abs(value).toFixed(2);
    const sign = value >= 0 ? "+" : "-";
    if (Math.abs(value) < 10) {
      return `${sign}0${fixed}`;
    }
    return `${sign}${fixed}`;
  }
  
  validateSPH(value: number): string | null {
    if (!this.isMultipleOfQuarter(value)) return null;
    if (value >= -60 && value <= 60) {
      return this.formatPower(value);
    }
    return null;
  }

  validateCYL(value: number): string | null {
    if (!this.isMultipleOfQuarter(value)) return null;
    if (value >= -15 && value <= 15) {
      return this.formatPower(value);
    }
    return null;
  }
  
  validateAxis(value: number): number | null {
    // if (!this.isMultipleOfQuarter(value)) return null;
    if (value >= 0 && value <= 180) {
      return value;
    }
    return null;
  }
  validatePD(value: number): number | null {
    if (!this.isMultipleOfQuarter(value)) return null;
    if (value >= 19 && value <= 85) {
      return value;
    }
    return null;
  }
  validateADD(value: number): string | null {
    if (!this.isMultipleOfQuarter(value)) return null;
    if (value >= 0.25 && value <= 6) {
      return this.formatPower(value);
    }
    return null;
  }

      /**
     * التحقق من SG (7 إلى 50)
     */
  validateSG(value: string | number): number | null {
      const num = parseFloat(value as string);
      return !isNaN(num) && num >= 7 && num <= 50 ?num : null;
    }
  
    /** 
     * التحقق من Vertex Distance (10 إلى 14)
     */
    checkVertexDistance(value: string | number): number | null {
      const num = parseFloat(value as string);
      return !isNaN(num) && num >= 10 && num <= 14 ?num : null;
    }

  /**
   * ✅ قاعدة التحوير (SPH + CYL , AXIS adjustment)
   */
  transformSphCylAxis(sph: number, cyl: number, axis: number): {
    sph: string;
    cyl: string;
    axis: number;
  } | null {
    if (!cyl || cyl === 0) return null; // لو مفيش CYL → ما نعدلش

    // CYL دايما بالسالب
    if (cyl > 0) cyl = -cyl;

    // حساب SPH الجديد
    const newSph = sph + cyl;

    // تعديل AXIS
    let newAxis = axis;
    if (axis > 90) {
      newAxis = axis - 90;
    } else {
      newAxis = axis + 90;
    }

    return {
      sph: this.formatPower(newSph),
      cyl: this.formatPower(cyl),
      axis: newAxis,
    };
  }
}
