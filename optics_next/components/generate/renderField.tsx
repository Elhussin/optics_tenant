// "use client"
// import { z } from 'zod';
// import { detectFieldType, unwrapSchema } from './detectFieldType';
// import { getFieldLabel, isFieldRequired } from './DynamicFormhelper';
// import { ForeignKeyField, UnionField } from './detectFieldType';
// import { fieldTemplates } from './dataConfig';
// import { Controller } from "react-hook-form";
// import ReactSelect from "react-select";
// import { useFieldOptions } from './detectFieldType';
// import { useEffect } from 'react';
// export const RenderField = ({ fieldName, fieldSchema, form, config , mode }: any) => {
//   const fieldType = detectFieldType(fieldName, fieldSchema);
//   const template = fieldTemplates[fieldType] || fieldTemplates['text'] || { component: 'input', type: 'text' };
//   const unwrappedSchema = unwrapSchema(fieldSchema);
//   const label = getFieldLabel(fieldName, fieldSchema);
//   const required = isFieldRequired(fieldSchema);

//   // const unwrappedSchema = unwrapSchema(fieldSchema);
//   const optionsSchema = unwrappedSchema as z.ZodEnum<any>;
//   const { data: options, loading } = useFieldOptions(fieldName, fieldType, optionsSchema);
//   console.log(options, fieldName);
//   useEffect(() => {
//     if (!loading && options.length > 0) {
//       const currentValue = form.getValues(fieldName);
//       if (currentValue && !options.find((opt: any) => opt.value === currentValue)) {
//         // لو القيمة موجودة في الفورم بس مش متعينة في select
//         const matched = options.find((opt: any) => opt.value === currentValue);
//         if (matched) {
//           form.setValue(fieldName, matched.value, { shouldValidate: true });
//         }
//       }
//     }
//   }, [loading, options, fieldName, form]);
  
//   if (fieldType === 'foreignkey') {
//     return (
//       <ForeignKeyField
//         key={fieldName}
//         fieldName={fieldName}
//         register={form.register}
//         config={config}
//         label={label}
//         required={required}
//         errors={form.formState.errors}
//         form={form}
//       />
//     );
//   }

//   // معالجة Union
//   if (fieldType === 'union') {
//     return (
//       <UnionField
//         key={fieldName}
//         fieldName={fieldName}
//         fieldSchema={fieldSchema}
//         register={form.register}
//         config={config}
//         label={label}
//         required={required}
//         errors={form.formState.errors}
//       />
//     );
//   }

//   // معالجة checkbox
//   if (template.wrapper === 'checkbox') {
//     return (
//       <div key={fieldName} className={config.spacing}>
//         <div className="flex items-center space-x-2">
//           <input
//             id={fieldName}
//             type="checkbox"
//             {...form.register(fieldName)}
//             className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//           />
//           <label htmlFor={fieldName} className={config.labelClasses}>
//             {label}
//           </label>
//         </div>
//         {form.formState.errors[fieldName] && (
//           <p className={config.errorClasses}>
//             {form.formState.errors[fieldName]?.message as string}
//           </p>
//         )}
//       </div>
//     );
//   }

  
//   if (fieldType === 'foreignkey' || (fieldType === 'select' && unwrappedSchema instanceof z.ZodEnum)) {
//     return (
//     <Controller
//       name={fieldName}
//       control={form.control}
//       rules={{ required: required ? `${label} is required` : false }}
//       render={({ field }) => {
//         // ابحث عن الـ option المطابق لقيمة الحقل
//         const selectedOption =
//           options.find((opt: any) => opt.value === field.value) || null;
//         console.log(selectedOption, field.value);

//         return (
//           <>
//           <ReactSelect
//             id={fieldName}
//             options={options}
//             isLoading={loading}
//             value={selectedOption} // ✅ هيتحدث لما options تيجي
//             onChange={(opt) => field.onChange(opt?.value)}
//             onBlur={field.onBlur}
//             isClearable
//             placeholder="Select..."
//             classNamePrefix="rs"
//           />
//           {form.formState.errors[fieldName] && (
//             <p className={config.errorClasses}>
//               {form.formState.errors[fieldName]?.message as string}
//             </p>
//           )}
//           </>
//         );
//   }}
// />

//     );
//   }


//   // معالجة textarea
//   if (fieldType === 'textarea') {
//     const rows = template.props?.rows || 3;
//     return (
//       <div key={fieldName} className={config.spacing}>
//         <label htmlFor={fieldName} className={config.labelClasses}>
//           {label}{required ? <span className="text-red-500">*</span> : ''}
//         </label>
//         <textarea
//           id={fieldName}
//           {...form.register(fieldName)}
//           className={config.baseClasses}
//           rows={rows}
//           placeholder={`${label}...`}
//           autoComplete="off"
//         />
//         {form.formState.errors[fieldName] && (
//           <p className={config.errorClasses}>
//             {form.formState.errors[fieldName]?.message as string}
//           </p>
//         )}
//       </div>
//     );
//   }



//   // معالجة array
//   if (fieldType === 'array') {
//     return (
//       <div key={fieldName} className={config.spacing}>
//         <label htmlFor={fieldName} className={config.labelClasses}>
//           {label}{required ? <span className="text-red-500">*</span> : ''}
//         </label>
//         <div className="space-y-2">
//           <input
//             id={fieldName}
//             type="text"
//             {...form.register(fieldName)}
//             className={config.baseClasses}
//             placeholder="add values separated by commas"
//             autoComplete="off"
//           />
//           <p className="text-xs text-gray-500">
//             add values separated by commas
//           </p>
//         </div>
//         {form.formState.errors[fieldName] && (
//           <p className={config.errorClasses}>
//             {form.formState.errors[fieldName]?.message as string}
//           </p>
//         )}
//       </div>
//     );
//   }

//   // معالجة object
//   if (fieldType === 'object') {
//     return (
//       <div key={fieldName} className={config.spacing}>
//         <label htmlFor={fieldName} className={config.labelClasses}>
//           {label}{required ? <span className="text-red-500">*</span> : ''}
//         </label>
//         <div className="border border-gray-200 rounded-md p-3">
//           <input
//             id={fieldName}
//             type="text"
//             {...form.register(fieldName)}
//             className={config.baseClasses}
//             autoComplete="off"
//             placeholder="JSON object"
//           />
//         </div>
//         {form.formState.errors[fieldName] && (
//           <p className={config.errorClasses}>
//             {form.formState.errors[fieldName]?.message as string}
//           </p>
//         )}
//       </div>
//     );
//   }

//   // معالجة input عادي
//   const inputType = template.type || 'text';
//   // const mode = form.formState.defaultValues ? 'edit' : 'create'; // A way to infer mode
//   const isDisabled = mode === 'edit' && (fieldName === 'username' || fieldName === 'password');

//   return (
//     <div key={fieldName} className={config.spacing}>
//       <label htmlFor={fieldName} className={config.labelClasses}>
//         {label}{required ? <span className="text-red-500">*</span> : ''}
//       </label>
//       <input
//         id={fieldName}
//         type={inputType}
//         {...form.register(fieldName)}
//         className={config.baseClasses}
//         placeholder={`${label}...`}
//         disabled={isDisabled}
//         autoComplete="off"
//         {...(template.props || {})}
//       />
//       {form.formState.errors[fieldName] && (
//         <p className={config.errorClasses}>
//           {form.formState.errors[fieldName]?.message as string}
//         </p>
//       )}
//     </div>
//   );
// };




//   // // معالجة select عادي (enum)
//   // if (fieldType === 'select' && unwrappedSchema instanceof z.ZodEnum) {
//   //   return (
  
//   //     <div key={fieldName} className={config.spacing}>
//   //     <label htmlFor={fieldName} className={config.labelClasses}>
//   //       {label}
//   //       {required ? <span className="text-red-500">*</span> : ''}
//   //     </label>
    
//   //     <Controller
//   //       name={fieldName}
//   //       control={form.control}
//   //       rules={{ required: required ? `${label} is required` : false }}
//   //       render={({ field }) => (
//   //         <ReactSelect
//   //             // menuPortalTarget={document.body}
//   //           id={fieldName}
//   //           options={unwrappedSchema.options.map((opt: string) => ({
//   //             label: getFieldLabel(opt, unwrappedSchema),
//   //             value: opt
//   //           }))}
//   //           onChange={(selectedOption) => field.onChange(selectedOption?.value)}
//   //           onBlur={field.onBlur}
//   //           value={
//   //             unwrappedSchema.options
//   //               .map((opt: string) => ({ label: opt, value: opt }))
//   //               .find((opt : any) => opt.value === field.value) || null
//   //           }
//   //           placeholder="Select..."
//   //           isClearable
//   //             classNamePrefix="rs"

//   //         />
//   //       )}
//   //     />
    
//   //     {form.formState.errors[fieldName] && (
//   //       <p className={config.errorClasses}>
//   //         {form.formState.errors[fieldName]?.message as string}
//   //       </p>
//   //     )}
//   //   </div>

//   //   );
//   // }
//   // if (fieldType === 'foreignkey') {
//   //   const { data: fkOptions, loading } = fkData;

//   //   console.log(fkOptions, fieldName);
  
//   //   return (
//   //     <div key={fieldName} className={config.spacing}>
//   //       <label htmlFor={fieldName} className={config.labelClasses}>
//   //         {label}
//   //         {required ? <span className="text-red-500">*</span> : ''}
//   //       </label>
  
//   //       <Controller
//   //         name={fieldName}
//   //         control={form.control}
//   //         rules={{ required: required ? `${label} is required` : false }}
//   //         render={({ field }) => {
//   //           const options = fkOptions.map((opt: any) => ({
//   //             label: opt.label || opt.name || String(opt.id),
//   //             value: opt.value || opt.id,
//   //           }));
  
//   //           // تأكد أن defaultValue يتظبط بعد تحميل البيانات
//   //           const selectedOption = options.find((opt) => opt.value === field.value) || null;
  
//   //           return (
//   //             <ReactSelect
//   //               id={fieldName}
//   //               options={options}
//   //               isLoading={loading}
//   //               onChange={(selectedOption) => field.onChange(selectedOption?.value)}
//   //               onBlur={field.onBlur}
//   //               value={selectedOption}
//   //               placeholder="Select..."
//   //               isClearable
//   //               classNamePrefix="rs"
//   //             />
//   //           );
//   //         }}
//   //       />
  
//   //       {form.formState.errors[fieldName] && (
//   //         <p className={config.errorClasses}>
//   //           {form.formState.errors[fieldName]?.message as string}
//   //         </p>
//   //       )}
//   //     </div>
//   //   );
//   // }


"use client";
import { z } from "zod";
// import { Controller } from "react-hook-form";
// import ReactSelect from "react-select";
import { useEffect } from "react";
import { ControlledSelect } from "./ControlledSelect";
import {
  detectFieldType,
  unwrapSchema,
  ForeignKeyField,
  UnionField,
  useFieldOptions,
} from "./detectFieldType";
import {
  getFieldLabel,
  isFieldRequired,
} from "../../lib/utils/DynamicFormhelper";
import { fieldTemplates } from "./dataConfig";

// ============================
// RenderField Component
// ============================
export const RenderField = ({ fieldName, fieldSchema, form, config, mode }: any) => {
  const fieldType = detectFieldType(fieldName, fieldSchema);
  const template =
    fieldTemplates[fieldType] || fieldTemplates["text"] || {
      component: "input",
      type: "text",
    };

  const unwrappedSchema = unwrapSchema(fieldSchema);
  const label = getFieldLabel(fieldName, fieldSchema);
  const required = isFieldRequired(fieldSchema);

  // Handle select / foreignkey options
  const { data: options, loading } = useFieldOptions(
    fieldName,
    fieldType,
    unwrappedSchema as z.ZodEnum<any>
  );


  useEffect(() => {
    if (!loading && options?.length) {
      const currentValue = form.getValues(fieldName);
      const exists = options.some((o: any) => o.value === currentValue);
      if (!exists) {
        // reset للقيمة الافتراضية لو موجودة بالـ defaultValues
        const defaultValue = form.formState.defaultValues?.[fieldName];
        if (defaultValue) {
          form.setValue(fieldName, defaultValue);
        }
      }
    }
  }, [loading, options, fieldName, form]);

  if (loading) {
    return <div className="animate-pulse h-9 w-full bg-gray-100 rounded" />;
  }
  // ============================
  // Renders by fieldType
  // ============================

  if (fieldType === "foreignkey") {
    return (
      <ForeignKeyField
        key={fieldName}
        fieldName={fieldName}
        register={form.register}
        config={config}
        label={label}
        required={required}
        errors={form.formState.errors}
        form={form}
      />
    );
  }

  if (fieldType === "union") {
    return (
      <UnionField
        key={fieldName}
        fieldName={fieldName}
        fieldSchema={fieldSchema}
        register={form.register}
        config={config}
        label={label}
        required={required}
        errors={form.formState.errors}
      />
    );
  }

  if (template.wrapper === "checkbox") {
    return (
      <div key={fieldName} className={config.spacing}>
        <div className="flex items-center space-x-2">
          <input
            id={fieldName}
            type="checkbox"
            {...form.register(fieldName)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor={fieldName} className={config.labelClasses}>
            {label}
          </label>
        </div>
        {form.formState.errors[fieldName] && (
          <p className={config.errorClasses}>
            {form.formState.errors[fieldName]?.message as string}
          </p>
        )}
      </div>
    );
  }

  if (fieldType === "select" || fieldType === "foreignkey"){
    return <ControlledSelect
    name={fieldName}
    control={form.control}
    options={options} 
    label={label} 
    required={required}
  
    />;

  }

  // if (fieldType === "select" || fieldType === "foreignkey") {
  //   return (
  //     <Controller
  //       name={fieldName}
  //       control={form.control}
  //       rules={{ required: required ? `${label} is required` : false }}
  //       render={({ field }) => {
  //         const selectedOption =
  //           options.find((opt: any) => opt.value === field.value) || null;
  //         return (
  //           <>
  //             <ReactSelect
  //               id={fieldName}
  //               options={options}
  //               isLoading={loading}
  //               value={selectedOption}
  //               onChange={(opt) => field.onChange(opt?.value)}
  //               onBlur={field.onBlur}
  //               isClearable
  //               placeholder={`Select ${label}...`}
  //               classNamePrefix="rs"
  //             />
  //             {form.formState.errors[fieldName] && (
  //               <p className={config.errorClasses}>
  //                 {form.formState.errors[fieldName]?.message as string}
  //               </p>
  //             )}
  //           </>
  //         );
  //       }}
  //     />
  //   );
  // }

//   <Controller
//   name={fieldName}
//   control={form.control}
//   rules={{ required: required ? `${label} is required` : false }}
//   render={({ field }) => {
//     // اختار option المطابق للقيمة الحالية
//     const selectedOption =
//       options.find((opt) => opt.value === field.value) || null;

//     return (
//       <ReactSelect
//         id={fieldName}
//         options={options}
//         value={selectedOption}
//         isLoading={loading}
//         onChange={(opt) => field.onChange(opt?.value)}
//         onBlur={field.onBlur}
//         isClearable
//         placeholder={`Select ${label}...`}
//         classNamePrefix="rs"
//       />
//     );
//   }}
// />

  if (fieldType === "textarea") {
    return (
      <div key={fieldName} className={config.spacing}>
        <label htmlFor={fieldName} className={config.labelClasses}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          id={fieldName}
          {...form.register(fieldName)}
          className={config.baseClasses}
          rows={template.props?.rows || 3}
          placeholder={`${label}...`}
          autoComplete="off"
        />
        {form.formState.errors[fieldName] && (
          <p className={config.errorClasses}>
            {form.formState.errors[fieldName]?.message as string}
          </p>
        )}
      </div>
    );
  }

  if (fieldType === "array") {
    return (
      <div key={fieldName} className={config.spacing}>
        <label htmlFor={fieldName} className={config.labelClasses}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <input
          id={fieldName}
          type="text"
          {...form.register(fieldName)}
          className={config.baseClasses}
          placeholder="add values separated by commas"
          autoComplete="off"
        />
        <p className="text-xs text-gray-500">
          add values separated by commas
        </p>
        {form.formState.errors[fieldName] && (
          <p className={config.errorClasses}>
            {form.formState.errors[fieldName]?.message as string}
          </p>
        )}
      </div>
    );
  }

  if (fieldType === "object") {
    return (
      <div key={fieldName} className={config.spacing}>
        <label htmlFor={fieldName} className={config.labelClasses}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <input
          id={fieldName}
          type="text"
          {...form.register(fieldName)}
          className={config.baseClasses}
          autoComplete="off"
          placeholder="JSON object"
        />
        {form.formState.errors[fieldName] && (
          <p className={config.errorClasses}>
            {form.formState.errors[fieldName]?.message as string}
          </p>
        )}
      </div>
    );
  }

  // default input
  const inputType = template.type || "text";
  const isDisabled =
    mode === "edit" &&
    (fieldName === "username" || fieldName === "password");

  return (
    <div key={fieldName} className={config.spacing}>
      <label htmlFor={fieldName} className={config.labelClasses}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={fieldName}
        type={inputType}
        {...form.register(fieldName)}
        className={config.baseClasses}
        placeholder={`${label}...`}
        disabled={isDisabled}
        autoComplete="off"
        {...(template.props || {})}
      />
      {form.formState.errors[fieldName] && (
        <p className={config.errorClasses}>
          {form.formState.errors[fieldName]?.message as string}
        </p>
      )}
    </div>
  );
};
