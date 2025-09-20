
import { EyeTestValidator } from "@/utils/EyeTestValidator"; // الكلاس اللي كتبناه

const validator = new EyeTestValidator();

export const handleFormatField =
  (setValue: any, getValues: any) =>
  (field: string, value: string) => {
    if (!value || isNaN(Number(value))) return;
    const num = Number(value);

    // Apply validation
    const formatted =
      field.includes("sphere") ? validator.validateSPH(num) :
      field.includes("cylinder") ? validator.validateCYL(num) :
      field.includes("axis") ? validator.validateAxis(num) :
      field.includes("add") ? validator.validateADD(num) :
      field.includes("pupillary_distance") ? validator.validatePD(num) :
      field.includes("sigmant") ? validator.validateSG(num) :
      null;

    if (formatted !== null) {
      setValue(field, formatted);

      // ✅ إذا كان الحقل SPH/CYL/AXIS → نعمل transform
      if (["sphere", "cylinder", "axis"].some(k => field.includes(k))) {
        const side = field.startsWith("right") ? "right" : "left";
        const sph = parseFloat(getValues(`${side}_sphere`));
        const cyl = parseFloat(getValues(`${side}_cylinder`));
        const axis = parseFloat(getValues(`${side}_axis`));
        if (!isNaN(sph) && !isNaN(cyl) && !isNaN(axis)) {
          const transformed = validator.transformSphCylAxis(sph, cyl, axis);
          if (transformed) {
            setValue(`${side}_sphere`, transformed.sph);
            setValue(`${side}_cylinder`, transformed.cyl);
            setValue(`${side}_axis`, transformed.axis);
          }
        }
      }
    }
  };

export const transformBeforeSubmit = (data: any) => {
  const sides: ("right" | "left")[] = ["right", "left"];
  sides.forEach(side => {
    const transformed = validator.transformSphCylAxis(
      parseFloat(data[`${side}_sphere`]),
      parseFloat(data[`${side}_cylinder`]),
      parseFloat(data[`${side}_axis`])
    );
    if (transformed) {
      data[`${side}_sphere`] = transformed.sph;
      data[`${side}_cylinder`] = transformed.cyl;
      data[`${side}_axis`] = transformed.axis;
    }
  });
  return data;
};
