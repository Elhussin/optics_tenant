"use client"
import { relationshipConfigs } from '@/src/features/formGenerator/constants/generatFormConfig';
import { useState } from 'react';
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { CirclePlus } from 'lucide-react';
import { RHFSelect } from './RHFSelect';
import { useForeignKeyData } from '../hooks/useForeignKeyData';
import { ForeignKeyFieldProps } from '../types';


export function ForeignKeyField(props: ForeignKeyFieldProps) {
  const { fieldName,register,config,label,required,errors,form,setShowModal } = props;
  const [data, setData] = useState<any[]>([]);
  const relationConfig = relationshipConfigs[fieldName];
  useForeignKeyData(relationConfig.entityName!, setData);

  if (!relationConfig) return null;

  return (
    <>
      {label && (
        <label htmlFor={fieldName} className="block font-medium text-sm m-1">
          {label}
          {required ? <span className="text-red-500"> *</span> : ''}
        </label>
      )}
      <div className={`flex items-center gap-2 ${config.spacing}`}>

        <RHFSelect
          name={fieldName}
          control={form.control}
          parsedOptions={data.map((item: any) => ({
            value: item?.[relationConfig?.valueField],
            label: item?.[relationConfig?.labelField],
          }))}
          label={label}
          required={required}
          placeholder="Select a country"
          className="flex-1"
        />

        <ActionButton
          onClick={() => setShowModal(true)}
          variant="outline"
          className="px-4 py-2" // padding مناسب للزر
          icon={<CirclePlus size={18} color="green" />}
          title="Add"
        />
      </div>
    </>
  );
}

