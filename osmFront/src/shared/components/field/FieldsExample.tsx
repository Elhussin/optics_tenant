/**
 * 🎨 مثال عملي لاستخدام مكونات الحقول المحسّنة
 * Example usage of enhanced Fields components
 */

"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  TextField,
  TextareaField,
  SelectField,
  SearchableSelect,
  MultiSelectField,
  MultiCheckbox,
  CheckboxField,
  SwitchField,
  RadioField,
} from "@/src/shared/components/field/Fields";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/shared/components/shadcn/ui/form";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";

// ✅ Schema مثال
const exampleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  description: z.string().optional(),
  category: z.string().min(1, "Please select a category"),
  country: z.string().min(1, "Please select a country"),
  tags: z.array(z.string()).min(1, "Select at least one tag"),
  features: z.array(z.string()),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms",
  }),
  notifications: z.boolean(),
  theme: z.enum(["light", "dark", "system"]),
});

type ExampleFormData = z.infer<typeof exampleSchema>;

// ✅ Options للـ Select و MultiSelect
const categoryOptions = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "food", label: "Food & Beverage" },
  { value: "books", label: "Books" },
];

const countryOptions = [
  { value: "sa", label: "Saudi Arabia 🇸🇦" },
  { value: "ae", label: "UAE 🇦🇪" },
  { value: "eg", label: "Egypt 🇪🇬" },
  { value: "jo", label: "Jordan 🇯🇴" },
  { value: "kw", label: "Kuwait 🇰🇼" },
];

const tagOptions = [
  { value: "new", label: "New Arrival" },
  { value: "sale", label: "On Sale" },
  { value: "featured", label: "Featured" },
  { value: "bestseller", label: "Best Seller" },
  { value: "limited", label: "Limited Edition" },
];

const featureOptions = [
  { value: "wifi", label: "WiFi" },
  { value: "bluetooth", label: "Bluetooth" },
  { value: "camera", label: "Camera" },
  { value: "gps", label: "GPS" },
  { value: "waterproof", label: "Waterproof" },
  { value: "wireless", label: "Wireless" },
];

export default function EnhancedFieldsExample() {
  const form = useForm<ExampleFormData>({
    resolver: zodResolver(exampleSchema),
    defaultValues: {
      name: "",
      email: "",
      description: "",
      category: "",
      country: "",
      tags: [],
      features: [],
      acceptTerms: false,
      notifications: true,
      theme: "system",
    },
  });

  const onSubmit = (data: ExampleFormData) => {
    console.log("✅ Form submitted:", data);
    // هنا يتم معالجة البيانات
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-gradient">
            🎨 Enhanced Fields Example
          </h1>
          <p className="text-muted-foreground">
            مثال عملي لجميع مكونات الحقول المحسّنة
          </p>
        </div>

        {/* Form */}
        <GlassCard className="animate-fade-in-up delay-200">
          <GlassCard.Header>
            <h2 className="text-2xl font-semibold">Product Information</h2>
            <p className="text-sm text-muted-foreground">
              Fill in the product details below
            </p>
          </GlassCard.Header>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 1️⃣ TextField Example */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <TextField
                      fieldRow={{
                        type: "text",
                        placeholder: "Enter product name...",
                        required: true,
                      }}
                      field={field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 2️⃣ TextField (Email) Example */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email *</FormLabel>
                    <TextField
                      fieldRow={{
                        type: "email",
                        placeholder: "example@email.com",
                        required: true,
                      }}
                      field={field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 3️⃣ TextareaField Example */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <TextareaField
                      fieldRow={{
                        placeholder: "Enter product description...",
                        required: false,
                      }}
                      field={field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Grid للحقول المتجاورة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 4️⃣ SelectField Example */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <SelectField
                        fieldRow={{
                          placeholder: "Select... ",
                          options: categoryOptions,
                        }}
                        field={field}
                        options={categoryOptions}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 5️⃣ SearchableSelect Example */}
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <SearchableSelect
                        fieldRow={{
                          label: "country",
                          placeholder: "Search country",
                        }}
                        field={field}
                        options={countryOptions}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 6️⃣ MultiSelectField Example */}
              <FormItem>
                <FormLabel>Tags *</FormLabel>
                <MultiSelectField
                  control={form.control}
                  fieldName="tags"
                  options={tagOptions}
                />
                <FormMessage />
              </FormItem>

              {/* 7️⃣ MultiCheckbox Example */}
              <FormItem>
                <FormLabel>Features</FormLabel>
                <MultiCheckbox
                  control={form.control}
                  fieldName="features"
                  fieldRow={{}}
                  options={featureOptions}
                />
                <FormMessage />
              </FormItem>

              {/* 8️⃣ RadioField Example */}
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme Preference</FormLabel>
                    <RadioField
                      fieldRow={{
                        options: [
                          { value: "light", label: "☀️ Light" },
                          { value: "dark", label: "🌙 Dark" },
                          { value: "system", label: "⚙️ System" },
                        ],
                      }}
                      field={field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 9️⃣ CheckboxField Example */}
              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem>
                    <CheckboxField
                      fieldRow={{
                        placeholder: "I accept the terms and conditions *",
                      }}
                      field={field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 🔟 SwitchField Example */}
              <FormField
                control={form.control}
                name="notifications"
                render={({ field }) => (
                  <FormItem>
                    <SwitchField
                      fieldRow={{
                        placeholder: "Enable email notifications",
                      }}
                      field={field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 h-12 text-base font-semibold transition-smooth hover-lift"
                >
                  ✅ Submit Form
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 px-8 transition-smooth hover-scale"
                  onClick={() => form.reset()}
                >
                  🔄 Reset
                </Button>
              </div>
            </form>
          </Form>
        </GlassCard>

        {/* Preview Card */}
        <GlassCard className="animate-fade-in-up delay-300">
          <GlassCard.Header>
            <h3 className="text-xl font-semibold">📋 Form Data Preview</h3>
          </GlassCard.Header>
          <pre className="bg-elevated rounded-lg p-4 overflow-x-auto scrollbar-thin text-sm">
            {JSON.stringify(form.watch(), null, 2)}
          </pre>
        </GlassCard>
      </div>
    </div>
  );
}
