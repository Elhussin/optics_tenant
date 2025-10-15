"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/shadcn/ui/select";
import { Checkbox } from "@/src/shared/components/shadcn/ui/checkbox";
// import { RadioGroup, RadioGroupItem } from "@/src/shared/components/shadcn/ui/radio-group";
import { Switch } from "@/src/shared/components/shadcn/ui/switch";
import { Button } from "@/src/shared/components/shadcn/ui/button";

// ✅ 1. تعريف شكل البيانات (schema) للتحقق من المدخلات
const FormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email."),
  message: z.string().optional(),
  category: z.string().min(1, "Please select a category."),
  newsletter: z.boolean().default(false),
  gender: z.enum(["male", "female"]),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof FormSchema>;

export default function ExampleForm() {
  // ✅ 2. إعداد react-hook-form مع zod للتحقق
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      category: "",
      newsletter: false,
      gender: "male",
      isActive: true,
    },
  });

  const onSubmit = (values: FormValues) => {
    console.log("✅ Submitted values:", values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 border rounded-lg max-w-md mx-auto">
        
        {/* 🧍 Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 📧 Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 📝 Textarea */}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea placeholder="Write something..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* 🔽 Select */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="bug">Report a Bug</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ☑️ Checkbox */}
        <FormField
          control={form.control}
          name="newsletter"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mt-0">Subscribe to newsletter</FormLabel>
            </FormItem>
          )}
        />

        {/* ⚧ RadioGroup */}
        {/* <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="male" />
                    </FormControl>
                    <FormLabel className="!mt-0">Male</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="female" />
                    </FormControl>
                    <FormLabel className="!mt-0">Female</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        /> */}

        {/* 🔘 Switch */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between border p-2 rounded-md">
              <FormLabel>Account Active</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}

        />
        <SearchableSelect/>

        {/* 🚀 Submit */}
        <Button type="submit" className="w-full">Submit</Button>
      </form>
    </Form>
  );
}






import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/shared/components/shadcn/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/shared/components/shadcn/ui/popover";
// SearchableSelect
const frameworks = [
  { value: "next.js", label: "Next.js" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "angular", label: "Angular" },
];

export function SearchableSelect(data: any) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? data.find((f:any) => f.value === value)?.label
            : "Select framework..."}
          <ChevronsUpDown className="opacity-50 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {data.optian.map((f:any) => (
                <CommandItem
                  key={f.value}
                  value={f.value}
                  onSelect={(currentValue:any) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === f.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {f.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
