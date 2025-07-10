// components/forms/detectInputType.ts
import { ZodTypeAny } from 'zod';

import { schemas } from '@/lib/api/zodClient';
import { z } from 'zod';
import { generateSearchFieldsFromEndpoint } from '@/lib/utils/generateSearchFieldsFromEndpoint';
import getFieldCode from './forms/GetFieldCode';
import { GeneratedFormProps } from '@/types';
import { useCrudFormRequest } from '@/lib/hooks/useCrudFormRequest';
import { useCrudHandlers } from '@/lib/hooks/useCrudHandlers';

export function GeneratedFormComponent(props: GeneratedFormProps) {


  const { schemaName, alias, onSuccess, onCancel, className = "", submitText = "Save", showCancelButton = true, defaultValues={} } = props;


  if (!schemaName || !(schemaName in schemas) || !alias) {console.error('❌schema or alias not found'); return; }



  const fields = generateSearchFieldsFromEndpoint(alias);
  const { handleCancel } = useCrudHandlers(alias!);
  const { form, onSubmit } = useCrudFormRequest({ alias: alias!, defaultValues, onSuccess: (res) => { onSuccess?.(res); form.reset(); }});

  const ignoredFields = ['id', 'created_at', 'updated_at', 'owner', 'tenant', 'is_superuser', 'group', 'is_deleted'];

  const schema = (schemas as any)[schemaName] as z.ZodObject<any>;
  const shape = schema.shape;
  const visibleFields = Object.keys(shape).filter((f) => !ignoredFields.includes(f));


  return (

    <div className={`${className}`}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {visibleFields.map((f) => getFieldCode(f, shape[f], form))}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className={`btn btn-primary ${form.formState.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {form.formState.isSubmitting ? 'Saving...' : submitText}
            </button>

            {showCancelButton && (
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
          {form.formState.errors.root && (
            <p className="error-text">
              {form.formState.errors.root.message as string}
            </p>
          )}
        </form>
    </div>
  );

}


