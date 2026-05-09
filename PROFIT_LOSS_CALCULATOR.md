# Profit/Loss Percentage Calculator - Feature Documentation

## Overview
Added an auto-calculated Profit/Loss percentage field to the Product Add/Edit form that provides real-time profit margin visibility for admins.

## Feature Details

### Location
- **Page**: Products
- **Section**: Product Add/Edit Modal
- **Position**: Right column, directly below the pricing fields (Cost Price, MRP, Selling Price)

### Calculation Formula
```
Percentage = ((Selling Price - Cost Price) / Cost Price) × 100
```

### Visual Design

#### Label
- **Text**: "Profit / Loss %"
- **Suffix**: "(Auto-calculated)" in smaller, lighter text
- **Tooltip**: "This shows profit or loss percentage based on cost price"

#### Display Field
- **Type**: Read-only display div (styled as disabled input)
- **Background**: Light gray (`bg-gray-50`)
- **Font**: Large, bold text for easy visibility
- **Border**: Standard gray border matching other inputs

### Color Coding

#### Profit (Positive %)
- **Color**: Green (`text-green-600`)
- **Display**: `+10.50%`
- **Meaning**: Selling price is higher than cost price

#### Loss (Negative %)
- **Color**: Red (`text-red-600`)
- **Display**: `-15.25%`
- **Meaning**: Selling price is lower than cost price

#### Zero Profit/Loss
- **Color**: Gray (`text-gray-500`)
- **Display**: `0.00%`
- **Meaning**: Selling price equals cost price

#### No Data
- **Color**: Light gray (`text-gray-400`)
- **Display**: "Enter cost price and selling price"
- **Meaning**: One or both price fields are empty or invalid

### Real-Time Calculation

The percentage updates automatically when:
1. User enters or changes the **Cost Price**
2. User enters or changes the **Selling Price**
3. User clears either field

No manual calculation or button press required!

### Edge Case Handling

#### Empty Cost Price
- **Result**: Shows placeholder text
- **Reason**: Cannot divide by zero

#### Empty Selling Price
- **Result**: Shows placeholder text
- **Reason**: Incomplete calculation

#### Cost Price = 0
- **Result**: Shows placeholder text
- **Reason**: Cannot divide by zero

#### Invalid Numbers
- **Result**: Shows placeholder text
- **Reason**: Cannot calculate with invalid input

#### Both Fields Valid
- **Result**: Shows calculated percentage with proper color

## Technical Implementation

### Function
```typescript
const calculateProfitLossPercentage = (): {
  value: string;
  isProfit: boolean;
  isLoss: boolean;
  isZero: boolean
} => {
  const costPrice = parseFloat(formData.cost_price);
  const sellingPrice = parseFloat(formData.selling_price);

  if (!costPrice || isNaN(costPrice) || costPrice === 0 || !sellingPrice || isNaN(sellingPrice)) {
    return { value: '-', isProfit: false, isLoss: false, isZero: true };
  }

  const percentage = ((sellingPrice - costPrice) / costPrice) * 100;
  const formattedPercentage = percentage.toFixed(2);

  return {
    value: percentage > 0 ? `+${formattedPercentage}%` : `${formattedPercentage}%`,
    isProfit: percentage > 0,
    isLoss: percentage < 0,
    isZero: percentage === 0
  };
};
```

### Key Features
- **Precision**: 2 decimal places
- **Sign Prefix**: Plus sign (+) for profits
- **Dynamic Styling**: Color changes based on profit/loss
- **No Database Storage**: Calculated on-the-fly every time

## Example Scenarios

### Scenario 1: Profitable Product
- **Cost Price**: ₹100
- **Selling Price**: ₹150
- **Display**: `+50.00%` (in green)

### Scenario 2: Loss-Making Product
- **Cost Price**: ₹200
- **Selling Price**: ₹150
- **Display**: `-25.00%` (in red)

### Scenario 3: Break-Even Product
- **Cost Price**: ₹100
- **Selling Price**: ₹100
- **Display**: `0.00%` (in gray)

### Scenario 4: High Margin Product
- **Cost Price**: ₹50
- **Selling Price**: ₹200
- **Display**: `+300.00%` (in green)

### Scenario 5: Small Loss
- **Cost Price**: ₹100
- **Selling Price**: ₹95
- **Display**: `-5.00%` (in red)

## Benefits

1. **Instant Feedback**: Admins see profit margins immediately
2. **Error Prevention**: Quickly spot pricing mistakes
3. **Informed Decisions**: Make better pricing decisions
4. **Visual Clarity**: Color coding for quick understanding
5. **No Extra Work**: Automatic calculation, no manual math

## User Experience

### For Adding New Products
1. Admin enters Cost Price
2. Admin enters Selling Price
3. Profit/Loss % updates automatically
4. Admin can adjust prices to achieve desired margin

### For Editing Existing Products
1. Modal opens with existing prices
2. Profit/Loss % displays current margin
3. Admin can see if pricing is profitable
4. Admin can adjust and see real-time impact

## Important Notes

- ✅ Field is **read-only** (not editable)
- ✅ Updates **instantly** on input change
- ✅ Does **not** break existing functionality
- ✅ Does **not** save to database
- ✅ Handles **all edge cases** gracefully
- ✅ Mobile responsive
- ✅ Clean UI integration

## Testing Checklist

- [ ] Add new product with profit margin
- [ ] Add new product with loss margin
- [ ] Add new product with zero margin
- [ ] Edit existing product and change prices
- [ ] Clear cost price field (should show placeholder)
- [ ] Clear selling price field (should show placeholder)
- [ ] Enter cost price as 0 (should show placeholder)
- [ ] Enter very large numbers (should calculate correctly)
- [ ] Enter decimal values (should calculate to 2 decimals)
- [ ] Check color coding for profit (green)
- [ ] Check color coding for loss (red)
- [ ] Check color coding for zero (gray)
- [ ] Verify mobile responsiveness
