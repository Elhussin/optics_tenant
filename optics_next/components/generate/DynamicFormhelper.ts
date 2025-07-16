import { GeneratorConfig, FieldTemplate,RelationshipConfig } from '@/types/DynamicFormTypes';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { schemas } from '@/lib/api/zodClient';
import { createFetcher } from '@/lib/hooks/useCrudFormRequest';
import { useCrudFormRequest } from '@/lib/hooks/useCrudFormRequest';
import { Loading4 } from '@/components/ui/loding';





export const defaultConfig: GeneratorConfig = {
  baseClasses: "input-base",
  labelClasses: "label",
  errorClasses: "error-text",
  submitButtonClasses: "btn btn-primary",
  submitButtonText: "Save",
  includeResetButton: true,
  spacing: "mb-4",
  containerClasses: "space-y-4"
};






export const fieldTemplates: Record<string, FieldTemplate> = {
  'email': { component: 'input', type: 'email' },
  'password': { component: 'input', type: 'password' },
  'url': { component: 'input', type: 'url' },
  'tel': { component: 'input', type: 'tel' },
  'number': { component: 'input', type: 'number' },
  'date': { component: 'input', type: 'date' },
  'datetime': { component: 'input', type: 'datetime-local' },
  'time': { component: 'input', type: 'time' },
  'textarea': { component: 'textarea', props: { rows: 3 } },
  'select': { component: 'select' },
  'checkbox': { component: 'input', type: 'checkbox', wrapper: 'checkbox' },
  'radio': { component: 'input', type: 'radio', wrapper: 'radio' },
  'file': { component: 'input', type: 'file' },
  'color': { component: 'input', type: 'color' },
  'range': { component: 'input', type: 'range' },
  'foreignkey': { component: 'select' },
  'union': { component: 'select' }
};


export const relationshipConfigs: RelationshipConfig = {
  user_id: {
    endpoint: 'users',
    labelField: 'name',
    valueField: 'id',
    searchField: 'name'
  },
  category_id: {
    endpoint: 'categories',
    labelField: 'name',
    valueField: 'id',
    searchField: 'name'
  },
  department_id: {
    endpoint: 'departments',
    labelField: 'name',
    valueField: 'id',
    searchField: 'name'
  },
  role_id: {
    endpoint: 'roles',
    labelField: 'name',
    valueField: 'id',
    searchField: 'name'
  }
};