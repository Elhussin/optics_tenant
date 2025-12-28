"use client"
import { relationshipConfigs } from '@/src/features/formGenerator/constants/generatFormConfig';
import { useEffect, useRef } from 'react';
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { CirclePlus } from 'lucide-react';
import { RHFSelect } from './RHFSelect';
import { useForeignKeyData } from '../hooks/useForeignKeyData';
import { ForeignKeyFieldProps } from '../types';
import { useFilteredListRequest } from '@/src/shared/hooks/useFilteredListRequest';
import { formsConfig } from '@/src/features/formGenerator/constants/entityConfig';

export function ForeignKeyField(props: ForeignKeyFieldProps) {
  const { fieldName, register, config, label, required, errors, form, setShowModal, fetchForginKey, setFetchForginKey } = props;

  const relationConfig = relationshipConfigs[fieldName];
  const alias = formsConfig[relationConfig?.entityName]?.listAlias;

  const { data, refetch } = useFilteredListRequest({ alias: alias!, defaultPage: 1, defaultPageSize: 1000, defaultAll: true })
  const parsedOptions = data.map((item: any) => ({
    value: item?.[relationConfig?.valueField],
    label: item?.[relationConfig?.labelField],
  }))

  const expectingUpdate = useRef(false);

  useEffect(() => {
    if (fetchForginKey) {
      expectingUpdate.current = true;
      refetch();
      setFetchForginKey(false);
    }
  }, [fetchForginKey, refetch, setFetchForginKey]);

  useEffect(() => {
    if (expectingUpdate.current && data?.length > 0 && relationConfig) {
      // Assuming new item is at the end of the list (default behavior)
      const lastItem = data[data.length - 1];
      if (lastItem) {
        form.setValue(fieldName, lastItem[relationConfig.valueField]);
      }
      expectingUpdate.current = false;
    }
  }, [data, fieldName, relationConfig, form]);
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
          parsedOptions={parsedOptions}
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

