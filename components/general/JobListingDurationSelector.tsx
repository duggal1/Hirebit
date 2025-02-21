import * as React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormControl } from "../ui/form";
import { ControllerRenderProps } from "react-hook-form";
import { jobListingDurationPricing } from "@/src/utils/pricingTiers";
import { Badge } from "@/components/ui/badge";

interface JobListingDurationSelectorProps {
  field: ControllerRenderProps<any, "listingDuration">;
}

export function JobListingDurationSelector({
  field,
}: JobListingDurationSelectorProps) {
  return (
    <FormControl>
      <RadioGroup
        value={field.value?.toString()}
        onValueChange={(value) => field.onChange(parseInt(value))}
      >
        <div className="grid gap-4">
          {jobListingDurationPricing.map((duration) => (
            <div key={duration.days} className="relative">
              <RadioGroupItem
                value={duration.days.toString()}
                id={duration.days.toString()}
                className="peer sr-only"
              />
              <Label
                htmlFor={duration.days.toString()}
                className="flex flex-col cursor-pointer"
              >
                <Card
                  className={`p-4 border-2 transition-all ${
                    field.value === duration.days
                      ? "border-primary bg-primary/10"
                      : "hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-lg">
                        {duration.days / 30} {duration.days / 30 === 1 ? 'Month' : 'Months'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {duration.description}
                      </p>
                      {duration.savings && (
                        <Badge variant="secondary" className="mt-1">
                          {duration.savings}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl">${duration.price.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        ${(duration.price / (duration.days / 30)).toFixed(2)}/month
                      </p>
                    </div>
                  </div>
                </Card>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </FormControl>
  );
}