
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserProfile } from "@/lib/types";
import { Save, Calculator } from "lucide-react";

const profileFormSchema = z.object({
  age: z.coerce.number().min(1, "Age must be at least 1.").max(120, "Age seems too high.").optional().or(z.literal("")),
  height: z.coerce.number().min(50, "Height must be at least 50 cm.").max(250, "Height seems too high.").optional().or(z.literal("")), // cm
  weight: z.coerce.number().min(1, "Weight must be at least 1 kg.").max(500, "Weight seems too high.").optional().or(z.literal("")), // kg
  sex: z.enum(["male", "female"], { errorMap: () => ({ message: "Please select a sex."}) }).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  initialData?: UserProfile;
  onSave: (data: UserProfile) => void;
}

export function ProfileForm({ initialData, onSave }: ProfileFormProps) {
  const [calculatedBmr, setCalculatedBmr] = React.useState<number | null>(initialData?.bmr ?? null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      age: initialData?.age || "" as unknown as number,
      height: initialData?.height || "" as unknown as number,
      weight: initialData?.weight || "" as unknown as number,
      sex: initialData?.sex || undefined,
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        age: initialData.age || "" as unknown as number,
        height: initialData.height || "" as unknown as number,
        weight: initialData.weight || "" as unknown as number,
        sex: initialData.sex || undefined,
      });
      setCalculatedBmr(initialData.bmr ?? null);
    }
  }, [initialData, form]);

  const watchedValues = form.watch();

  React.useEffect(() => {
    const { age, height, weight, sex } = watchedValues;
    if (age && height && weight && sex && Number(age) > 0 && Number(height) > 0 && Number(weight) > 0) {
      let bmr = 0;
      const numWeight = Number(weight);
      const numHeight = Number(height);
      const numAge = Number(age);

      if (sex === 'male') {
        bmr = (10 * numWeight) + (6.25 * numHeight) - (5 * numAge) + 5;
      } else {
        bmr = (10 * numWeight) + (6.25 * numHeight) - (5 * numAge) - 161;
      }
      setCalculatedBmr(Math.round(bmr));
    } else {
      setCalculatedBmr(null);
    }
  }, [watchedValues]);

  function onSubmit(values: ProfileFormValues) {
    const profileDataToSave: UserProfile = {
      age: values.age ? Number(values.age) : undefined,
      height: values.height ? Number(values.height) : undefined,
      weight: values.weight ? Number(values.weight) : undefined,
      sex: values.sex,
      bmr: calculatedBmr ?? undefined,
    };
    onSave(profileDataToSave);
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Your Profile</CardTitle>
        <CardDescription>
          Enter your details to calculate your Basal Metabolic Rate (BMR).
          BMR is the number of calories your body needs to accomplish its most basic (basal) life-sustaining functions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (Years)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 30" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 175" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 70.5" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4 pt-2"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="male" />
                          </FormControl>
                          <FormLabel className="font-normal">Male</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="female" />
                          </FormControl>
                          <FormLabel className="font-normal">Female</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {calculatedBmr !== null && (
              <Card className="mt-6 bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <Calculator className="mr-2 h-5 w-5 text-primary" /> Estimated BMR
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary text-center">
                    {calculatedBmr} <span className="text-lg font-normal text-muted-foreground">kcal / day</span>
                  </p>
                </CardContent>
              </Card>
            )}
            
            <Button type="submit" className="w-full md:w-auto">
              <Save className="mr-2 h-4 w-4" /> Save Profile
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
