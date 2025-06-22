"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var api_zod_1 = require("../src/api-zod"); // تأكد أن المسار صحيح
var zod_1 = require("zod");
// اسم schema من الطرفية
var _a = process.argv, schemaName = _a[2];
if (!schemaName || !(schemaName in api_zod_1.schemas)) {
    console.error('❌ أدخل اسم schema صالح موجود في zodSchemas.ts');
    process.exit(1);
}
var schema = api_zod_1.schemas[schemaName];
var pascal = schemaName.replace(/(^\w|_\w)/g, function (m) { return m.replace('_', '').toUpperCase(); });
var formFile = "components/forms/".concat(pascal, "Form.tsx");
var hookFile = "lib/forms/use".concat(pascal, "Form.ts");
var shape = schema.shape;
var fields = Object.keys(shape);
function getFieldCode(field, fieldSchema) {
    var inputType = 'text';
    var inputElement = '';
    var baseClasses = "\"w-full border border-gray-300 rounded-md px-3 py-2\"";
    if (fieldSchema instanceof zod_1.z.ZodNumber) {
        inputType = 'number';
        inputElement = "<input id=\"".concat(field, "\" type=\"").concat(inputType, "\" {...register(\"").concat(field, "\")} className=").concat(baseClasses, " />");
    }
    else if (fieldSchema instanceof zod_1.z.ZodString) {
        // Check for email, password, etc. via refinements or description
        var checks = fieldSchema._def.checks || [];
        var hasEmail = checks.some(function (c) { return c.kind === 'email'; });
        var hasMinLength = checks.some(function (c) { return c.kind === 'min' && c.value >= 6; });
        if (hasEmail)
            inputType = 'email';
        else if (hasMinLength)
            inputType = 'password';
        inputElement = "<input id=\"".concat(field, "\" type=\"").concat(inputType, "\" {...register(\"").concat(field, "\")} className=").concat(baseClasses, " />");
    }
    else if (fieldSchema instanceof zod_1.z.ZodEnum) {
        var options = fieldSchema.options
            .map(function (opt) { return "<option value=\"".concat(opt, "\">").concat(opt, "</option>"); })
            .join('\n    ');
        inputElement = "\n    <select id=\"".concat(field, "\" {...register(\"").concat(field, "\")} className=").concat(baseClasses, ">\n      <option value=\"\">\u0627\u062E\u062A\u0631...</option>\n      ").concat(options, "\n    </select>\n    ");
    }
    else {
        // fallback to default text input
        inputElement = "<input id=\"".concat(field, "\" type=\"text\" {...register(\"").concat(field, "\")} className=").concat(baseClasses, " />");
    }
    return "\n  <div className=\"mb-4\">\n    <label htmlFor=\"".concat(field, "\" className=\"block text-sm font-medium mb-1 capitalize\">").concat(field, "</label>\n    ").concat(inputElement, "\n    {errors.").concat(field, " && <p className=\"text-red-500 text-sm\">{errors.").concat(field, ".message}</p>}\n  </div>\n  ");
}
var formCode = "import { use".concat(pascal, "Form } from '@/lib/forms/use").concat(pascal, "Form';\n\nexport default function ").concat(pascal, "Form({ defaultValues, onSuccess }: any) {\n  const { register, handleSubmit, formState: { errors }, handleServerErrors } = use").concat(pascal, "Form(defaultValues);\n\n  const onSubmit = async (data: any) => {\n    try {\n      await api.post('/api/YOUR_ENDPOINT/', data);\n      onSuccess?.();\n    } catch (e: any) {\n      if (e.response?.status === 400) {\n        handleServerErrors(e.response.data);\n      }\n    }\n  };\n\n  return (\n    <form onSubmit={handleSubmit(onSubmit)} className=\"space-y-4\">\n      ").concat(fields.map(function (f) { return getFieldCode(f, shape[f]); }).join('\n'), "\n      <button type=\"submit\" className=\"bg-blue-600 text-white px-4 py-2 rounded\">\u062D\u0641\u0638</button>\n    </form>\n  );\n}\n");
var hookCode = "import { z } from 'zod';\nimport { useForm } from 'react-hook-form';\nimport { zodResolver } from '@hookform/resolvers/zod';\nimport { schemas } from '@/api-zod/zodSchemas';\n\nconst schema = schemas.".concat(schemaName, ";\n\nexport function use").concat(pascal, "Form(defaultValues?: Partial<z.infer<typeof schema>>) {\n  const methods = useForm<z.infer<typeof schema>>({\n    resolver: zodResolver(schema),\n    defaultValues,\n  });\n\n  const handleServerErrors = (apiErrors: any) => {\n    Object.entries(apiErrors).forEach(([field, messages]) => {\n      methods.setError(field as any, {\n        type: 'server',\n        message: messages[0],\n      });\n    });\n  };\n\n  return {\n    ...methods,\n    handleServerErrors,\n  };\n}\n");
fs_1.default.mkdirSync(path_1.default.dirname(formFile), { recursive: true });
fs_1.default.mkdirSync(path_1.default.dirname(hookFile), { recursive: true });
fs_1.default.writeFileSync(formFile, formCode);
fs_1.default.writeFileSync(hookFile, hookCode);
console.log("\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0644\u0641\u0627\u062A:\n- ".concat(formFile, "\n- ").concat(hookFile));
// npx ts-node scripts/generate-zod-form.ts UserRequest
// install ts-node typescript --save-dev
// pnpm install --save-dev ts-node typescript
// npx ts-node --loader ts-node/esm scripts/generate-zod-form.ts UserRequest
