// eyeTestValidator.ts
export class EyeTestValidator {
    /**
     * التحقق إذا الرقم من مضاعفات 0.25
     */
    isMultipleOfQuarter(value: string | number): boolean {
      const num = parseFloat(value as string);
      return !isNaN(num) && num % 0.25 === 0;
    }
  
    /**
     * فورمات الباور (SPH, CYL) مع الإشارة وعشريتين
     */
    formatEyeTestPower(value: string | number): string | false {
      const num = parseFloat(value as string);
      if (isNaN(num) || !this.isMultipleOfQuarter(num)) return false;
      return num.toFixed(2).padStart(6, num >= 0 ? "+" : "-");
    }
  
    /**
     * التحقق من AX (1 إلى 180)
     */
    checkAxis(value: string | number): boolean {
      const num = parseFloat(value as string);
      return !isNaN(num) && num >= 1 && num <= 180;
    }
  
    /**
     * التحقق من PD (19 إلى 85)
     */
    checkPD(value: string | number): boolean {
      const num = parseFloat(value as string);
      return !isNaN(num) && num >= 19 && num <= 85;
    }
  
    /**
     * إزالة الإشارة +-
     */
    removeSign(value: string | number): string | null {
      const num = parseFloat(value as string);
      return isNaN(num) ? null : Math.abs(num).toFixed(2);
    }
  
    /**
     * التحقق من ADD (0.25 إلى 4)
     */
    checkAdd(value: string | number): boolean {
      const num = parseFloat(value as string);
      return !isNaN(num) && num > 0 && num >= 0.25 && num <= 4;
    }
  
    /**
     * تحويل آمن إلى Float
     */
    safeFloatConvert(value: string | number, defaultValue = 0): number {
      if (value === "" || value === null || value === undefined) return defaultValue;
      const num = parseFloat(value as string);
      return isNaN(num) ? defaultValue : num;
    }
  
    /**
     * إعادة تنسيق SPH, CY, AX حسب قواعد معينة
     */
    powerFormat(data: { SPH?: string; CY?: string; AX?: string }) {
      let SPH = this.safeFloatConvert(data.SPH ?? "");
      let CY = this.safeFloatConvert(data.CY ?? "");
      let AX = this.safeFloatConvert(data.AX ?? "");
  
      if (!(SPH <= 0 && CY <= 0) && !(SPH > 0 && CY <= 0)) {
        SPH = SPH + CY;
        CY = CY * -1;
        if (AX < 90) AX += 90;
        else if (AX > 90) AX -= 90;
      }
  
      return {
        SPH: this.formatEyeTestPower(SPH) || "0.00",
        CY: this.formatEyeTestPower(CY) || "0.00",
        AX: AX.toFixed(0),
      };
    }
  
    /**
     * التحقق من CYL و AX معًا
     */
    checkCylAxNotNull(data: { CY?: string; AX?: string }): boolean {
      const CY = this.safeFloatConvert(data.CY ?? "");
      const AX = this.safeFloatConvert(data.AX ?? "");
  
      if (CY !== 0 && AX === 0) return false;
      if (CY === 0 && AX !== 0) return false;
      return true;
    }
  
    /**
     * التحقق من SG (7 إلى 50)
     */
    checkSG(value: string | number): boolean {
      const num = parseFloat(value as string);
      return !isNaN(num) && num >= 7 && num <= 50;
    }
  
    /**
     * التحقق من Vertex Distance (10 إلى 14)
     */
    checkVertexDistance(value: string | number): boolean {
      const num = parseFloat(value as string);
      return !isNaN(num) && num >= 10 && num <= 14;
    }
  }
  