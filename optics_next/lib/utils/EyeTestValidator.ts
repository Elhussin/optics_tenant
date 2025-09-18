
export class EyeTestValidator {
  // isMultipleOfQuarter
  isMultipleOfQuarter(value: number): boolean {
    return Math.round(value * 100) % 25 === 0;
  }

// format power
  formatPower(value: number): string {
    const fixed = Math.abs(value).toFixed(2);
    const sign = value > 0 ? "+" : value <= 0 ? "-" : "";
    // if (Math.abs(value) < 10  && value !== 0) {
      if (Math.abs(value) < 10 ) {
      return `${sign}0${fixed}`;
    }
    // if (value === 0) return "-00.00";
    return `${sign}${fixed}`;
  }

  validateSPH(value: number): string | null {
    if (!this.isMultipleOfQuarter(value)) return null;
    if (value < -60 || value > 60) return null;
    return this.formatPower(value);
  }

  validateCYL(value: number): string | null {
    if (!this.isMultipleOfQuarter(value)) return null;
    if (value < -15 || value > 15) return null;
    return this.formatPower(value);
  }

  validateAxis(value: number): number | null {
    if (value < 0 || value > 180) return null;
    return Math.round(value); // return rounded value integer
  }

  validatePD(value: number): number | null {
    const num = Number(value);
    return !isNaN(num) && num >= 19 && num <= 85 ? num : null;
  }

  validateADD(value: number): string | null {
    if (!this.isMultipleOfQuarter(value)) return null;
    if (value < 0.25 || value > 6) return null;
    return this.formatPower(value);
  }

  validateSG(value: string | number): number | null {
    const num = Number(value);
    return !isNaN(num) && num >= 7 && num <= 50 ? num : null;
  }


  checkVertexDistance(value: string | number): number | null {
    const num = Number(value);
    return !isNaN(num) && num >= 10 && num <= 14 ? num : null;
  }

  // التحويل بين SPH/CYL/AXIS
  transformSphCylAxis(sph: number, cyl: number, axis: number) {
    const sphNum = Number(sph);
    const cylNum = Number(cyl);
    const axisNum = Number(axis);

    if (!cylNum || cylNum <= 0) return null; // لو مفيش CYL → ما نعدلش

    // CYL دايمًا بالسالب
    const newCyl: number =  -cylNum;

    // حساب SPH الجديد
    const newSph = sphNum + cylNum;

    // تعديل AXIS
    let newAxis = axisNum > 90 ? axisNum - 90 : axisNum + 90;
    newAxis = this.validateAxis(newAxis) ?? newAxis;

    return {
      sph: this.formatPower(newSph),
      cyl: this.formatPower(newCyl),
      axis: newAxis,
    };
  }


  checkSphCylAxisCombo(
    sph: number | string | null | undefined,
    cyl: number | string | null | undefined,
    axis: number | string | null | undefined
  ): boolean {
    const hasSph = !!sph
    const hasCyl = !!cyl && Number(cyl) !== 0;
    const hasAxis = !!axis && Number(axis) !== 0;
  
    if (hasSph && !hasCyl && !hasAxis) return true;
    if (hasSph && hasCyl && hasAxis) return true;
    if (!hasSph && hasCyl && hasAxis) return true;
    return false;
  }
  
  validatePrescription(data: {
    sphere?: number | string | null;
    cylinder?: number | string | null;
    axis?: number | string | null;
    add?: number | string | null;
    pd?: number | string | null;
    sg?: number | string | null;
    vertexDistance?: number | string | null;
  }): { valid: boolean; errors: string[]; formatted: any } {
    const errors: string[] = [];
    const formatted: any = {};
  
    // SPH/CYL/AXIS combo check
    if (!this.checkSphCylAxisCombo(data.sphere, data.cylinder, data.axis)) {
      errors.push("CYL and AXIS must be entered together or both left empty when SPH exists.");
    }
  
    // SPH
    if (data.sphere !== null && data.sphere !== undefined && data.sphere !== "") {
      const sph = this.validateSPH(Number(data.sphere));
      if (!sph) errors.push("SPH must be multiple of 0.25 and between -60.00 and +60.00.");
      else formatted.sphere = sph;
    }
  
    // CYL
    if (data.cylinder !== null && data.cylinder !== undefined && data.cylinder !== "") {
      const cyl = this.validateCYL(Number(data.cylinder));
      if (!cyl) errors.push("CYL must be multiple of 0.25 and between -15.00 and +15.00.");
      else formatted.cylinder = cyl;
    }
  
    // AXIS
    if (data.axis !== null && data.axis !== undefined && data.axis !== "") {
      const axis = this.validateAxis(Number(data.axis));
      if (axis === null) errors.push("AXIS must be an integer between 0 and 180.");
      else formatted.axis = axis;
    }
  
    // ADD
    if (data.add !== null && data.add !== undefined && data.add !== "") {
      const add = this.validateADD(Number(data.add));
      if (!add) errors.push("ADD must be multiple of 0.25 and between +0.25 and +6.00.");
      else formatted.add = add;
    }
  
    // PD
    if (data.pd !== null && data.pd !== undefined && data.pd !== "") {
      const pd = this.validatePD(Number(data.pd));
      if (pd === null) errors.push("PD must be integer between 19 and 85.");
      else formatted.pd = pd;
    }
  
    // SG
    if (data.sg !== null && data.sg !== undefined && data.sg !== "") {
      const sg = this.validateSG(data.sg);
      if (sg === null) errors.push("SG must be between 7 and 50.");
      else formatted.sg = sg;
    }
  
    // Vertex Distance
    // if (data.vertexDistance !== null && data.vertexDistance !== undefined && data.vertexDistance !== "") {
    //   const vd = this.checkVertexDistance(data.vertexDistance);
    //   if (vd === null) errors.push("Vertex Distance must be between 10 and 14.");
    //   else formatted.vertexDistance = vd;
    // }
  
    return { valid: errors.length === 0, errors, formatted };
  }
  
}
