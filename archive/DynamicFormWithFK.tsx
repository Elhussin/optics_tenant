"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/shared/components/shadcn/ui/form";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { Textarea } from "@/src/shared/components/shadcn/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/src/shared/components/shadcn/ui/select";
import { Checkbox } from "@/src/shared/components/shadcn/ui/checkbox";
import { Switch } from "@/src/shared/components/shadcn/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/src/shared/components/shadcn/ui/radio-group";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProductFormStore } from "../store/useProductFormStore";
import { useProductRelations } from "../hooks/useProductRelations";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { parsedOptions } from "../utils/parsedOptions";
import { selectRelatedData } from "../utils/selectRelatedData";
import { Loading } from "@/src/shared/components/ui/loding";
// Types
type FieldType = "text" | "email" | "number" | "textarea" | "select" | "checkbox" | "switch" | "radio";

interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: { value: any; label: string }[];
  optionsEndpoint?: string;
  defaultValue?: any;
  required?: boolean;
}

interface DynamicFormWithFKProps {
  schema: z.ZodType<any>;
  fields: FieldConfig[];
  onSubmit: (values: Record<string, any>) => void;
}

export default function DynamicFormWithFK({ schema, fields, onSubmit }: DynamicFormWithFKProps) {
  const { isVariant, setIsVariant, variantCount, variants, setVariantCount,
    setVariantField, openVariantIndex, toggleVariant, setOpenVariantIndex, data, } = useProductFormStore();


  const { isLoading } = useProductRelations();
  const form = useApiForm({
    alias: "products_products_create",
    defaultValues: fields.reduce((acc, f) => {
      acc[f.name] = f.defaultValue ?? (f.type === "checkbox" || f.type === "switch" ? false : "");
      return acc;
    }, {} as Record<string, any>),
  });

  // const form = useForm({
  //   resolver: zodResolver(schema as any),
  //   defaultValues: fields.reduce((acc, f) => {
  //     acc[f.name] = f.defaultValue ?? (f.type === "checkbox" || f.type === "switch" ? false : "");
  //     return acc;
  //   }, {} as Record<string, any>),
  // });

  const [productType, brand_id, model] = form.watch(["type", "brand_id", "model"]);


  const filterData = (
    data: any,
    item: any,
    selectedType: any,
    subField?: string,
    subFilter?: string
  ) => {
    console.log("item", item);
    const filterField = item.filter;
    const selectedData = selectRelatedData(data, filterField);
    let filteredData = selectedData;
    if (subField && subFilter && filterField === subField) {
      filteredData = selectedData?.filter(
        (v: any) => v[subFilter] === selectedType || v[subFilter] === "All"
      );
    }
    console.log("filteredData", filteredData);
    return parsedOptions(filteredData, item);
  };

  if (isLoading) return <Loading />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 border rounded-lg max-w-md mx-auto">
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  {(() => {
                    switch (field.type) {
                      case "text":
                      case "email":
                      case "number":
                        return <Input type={field.type} placeholder={field.placeholder} {...f} />;
                      case "textarea":
                        return <Textarea placeholder={field.placeholder} {...f} />;
                      case "select":
                        if (isLoading) return <div>Loading...</div>;
                        return (
                          <Select onValueChange={f.onChange} value={f.value}>
                            <SelectTrigger>
                              <SelectValue placeholder={field.placeholder || "Select"} />
                            </SelectTrigger>
                            <SelectContent>

                              {(field.options || [{value:"",label:""}]).map((opt: any) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        );
                      case "checkbox":
                        return (
                          <div className="flex items-center space-x-2">
                            <Checkbox checked={f.value} onCheckedChange={f.onChange} />
                            <span>{field.placeholder}</span>
                          </div>
                        );
                      case "switch":
                        return (
                          <div className="flex justify-between items-center border p-2 rounded-md">
                            <span>{field.placeholder}</span>
                            <Switch checked={f.value} onCheckedChange={f.onChange} />
                          </div>
                        );
                      case "radio":
 
                      default:
                        return null;
                    }
                  })()}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="submit" className="w-full">Submit</Button>
      </form>
    </Form>
  );
}
