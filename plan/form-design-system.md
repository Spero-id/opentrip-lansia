# 🎯 Form Design System Specification

## Design Tokens (globals.css)
```css
:root {
  --radius: 0.25rem;              /* 4px base */
  --radius-sm: calc(var(--radius) - 2px);  /* 2px */
  --radius-md: var(--radius);      /* 4px */
  --radius-lg: calc(var(--radius) + 4px);  /* 8px */
  --radius-xl: calc(var(--radius) + 8px);  /* 12px */
  --radius-full: 9999px;
}
```

---

## 1. Button (components/ui/button.tsx) ✅ EXISTING

| Variant | Class | Use Case |
|---|---|---|
| `primary` | `bg-primary text-primary-foreground hover:bg-primary/80` | Main CTA |
| `secondary` | `bg-secondary text-secondary-foreground hover:bg-secondary/80` | Secondary action |
| `outline` | `border-border bg-background hover:bg-muted` | Tertiary |
| `ghost` | `hover:bg-muted hover:text-foreground` | Minimal |
| `destructive` | `bg-destructive text-destructive-foreground hover:bg-destructive/80` | Danger |
| `link` | `text-primary underline-offset-4 hover:underline` | Text-like |

| Size | Class | Use Case |
|---|---|---|
| `xs` | `h-6 px-2 text-xs rounded-sm` | Icon btn, chips |
| `sm` | `h-7 px-2.5 text-xs rounded-md` | Compact forms |
| `default` | `h-8 px-3 text-sm rounded-md` | Standard |
| `lg` | `h-10 px-4 text-base rounded-lg` | Hero CTA |
| `xl` | `h-12 px-6 text-lg rounded-xl` | Landing hero |
| `icon` | `h-8 w-8 rounded-md` | Square icon |
| `icon-sm` | `h-6 w-6 rounded-sm` | Small icon |
| `icon-lg` | `h-10 w-10 rounded-lg` | Large icon |

---

## 2. Input (components/ui/input.tsx) ✅ EXISTING
```tsx
// Base: h-8 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm
// Focus: focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring
// Disabled: disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted
// Error: aria-invalid:border-destructive aria-invalid:ring-destructive/20
```

| Size | Class | Use Case |
|---|---|---|
| `sm` | `h-7 px-2.5 text-xs rounded-md` | Compact |
| `default` | `h-8 px-3 text-sm rounded-md` | Standard |
| `lg` | `h-10 px-4 text-base rounded-lg` | Hero forms |

---

## 3. Textarea (components/ui/textarea.tsx) ✅ EXISTING
```tsx
// Base: flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm
// Resize: resize-none / resize-y / resize
```

| Size | Class | Use Case |
|---|---|---|
| `sm` | `min-h-[60px] px-2.5 text-xs rounded-md` | Compact |
| `default` | `min-h-[80px] px-3 text-sm rounded-md` | Standard |
| `lg` | `min-h-[100px] px-4 text-base rounded-lg` | Large |

---

## 4. Select (components/ui/select.tsx) ✅ EXISTING
```tsx
// Trigger: h-8 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm
// Content: overflow-hidden bg-popover text-popover-foreground shadow-md rounded-md border border-border
// Item: relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-3 pr-8 text-sm
// Selected: bg-primary text-primary-foreground focus:bg-primary/80
```

| Size | Class | Use Case |
|---|---|---|
| `sm` | `h-7 px-2.5 text-xs rounded-md` | Compact |
| `default` | `h-8 px-3 text-sm rounded-md` | Standard |
| `lg` | `h-10 px-4 text-base rounded-lg` | Hero forms |

---

## 5. Checkbox (components/ui/checkbox.tsx) ✅ EXISTING
```tsx
// Base: h-4 w-4 rounded-sm border border-input bg-background shadow-sm
// Checked: bg-primary text-primary-foreground
// Indeterminate: bg-primary text-primary-foreground
// Focus: focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring
```

---

## 6. Radio (components/ui/radio-group.tsx) ✅ EXISTING
```tsx
// Item: aspect-square h-4 w-4 rounded-full border border-input bg-background shadow-sm
// Checked: bg-primary text-primary-foreground
```

---

## 7. Switch (components/ui/switch.tsx) ✅ EXISTING
```tsx
// Base: flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent
// Thumb: pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0
// Checked: bg-primary translate-x-5
```

---

## 8. Label (components/ui/label.tsx) ✅ EXISTING
```tsx
// Base: text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70
```

---

## 9. Form Field Wrapper (components/ui/form-field.tsx) — NEW COMPOSITE

```tsx
// Structure:
<FormField>
  <FormField.Label />      // Label text
  <FormField.Input />       // Input/Select/Textarea/Select
  <FormField.Description /> // Helper text (optional)
  <FormField.Error />       // Error message (optional)
</FormField>

// Layout:
<div className="space-y-1.5">
  <Label className="text-sm font-medium text-foreground" />
  <Input className="..." />
  <p className="text-xs text-muted-foreground" />     // Description
  <p className="text-xs text-destructive" />          // Error
</div>

// With error: input gets `aria-invalid` + `border-destructive focus:border-destructive`
```

---

## 10. Form Section / Card — NEW COMPOSITE

```tsx
// Card wrapper for form sections
<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
  <div className="mb-4">
    <h3 className="text-lg font-semibold text-foreground" />     // Section title
    <p className="text-sm text-muted-foreground mt-1" />         // Section description
  </div>
  <div className="space-y-4">
    {/* FormField components */}
  </div>
</div>
```

---

## Migration Rules (Auto-Mapping)

| Native Element | ShadCN Component | Variant/Size Mapping |
|---|---|---|
| `<button className="w-full bg-primary...">` | `<Button size="lg" variant="primary">` | `w-full` → `className="w-full"` |
| `<button className="p-2 rounded-xl hover:bg-primary/10">` | `<Button size="icon" variant="ghost">` | `p-2 rounded-xl` → `size="icon"` |
| `<input className="w-full px-3 py-2 rounded-lg...">` | `<Input size="default">` | `rounded-lg` → default radius |
| `<input className="w-full px-3 py-3 rounded-xl...">` | `<Input size="lg">` | `py-3 rounded-xl` → `size="lg"` |
| `<textarea className="w-full px-3 py-2 rounded-lg...">` | `<Textarea size="default">` | |
| `<select className="w-full px-3 py-2 rounded-lg...">` | `<Select size="default">` | |
| `<input type="checkbox" className="h-4 w-4 rounded...">` | `<Checkbox />` | |
| `<input type="radio" className="h-4 w-4 rounded-full...">` | `<RadioGroup><RadioGroup.Item /></RadioGroup>` | |
| `<label className="text-sm font-medium...">` | `<Label />` | |

---

## File Structure
```
src/components/ui/
├── button.tsx          ✅ (add xl, icon-sm, icon-lg sizes)
├── input.tsx           ✅ (add sm, lg sizes)
├── textarea.tsx        ✅ (add sm, lg sizes)
├── select.tsx          ✅ (add sm, lg sizes)
├── checkbox.tsx        ✅
├── radio-group.tsx     ✅
├── switch.tsx          ✅
├── label.tsx           ✅
├── form-field.tsx      🆕 NEW composite
├── form-section.tsx    🆕 NEW composite
├── card.tsx            ✅
└── index.ts            (re-export all)
```

---

## Migration Priority
1. **Phase 1**: Update component library (button sizes, input sizes, new components)
2. **Phase 2**: Auth pages (login, register) — highest visibility
3. **Phase 3**: Contact, Checkout forms — high visibility
4. **Phase 4**: Admin forms (CRUD) — many forms, high impact
5. **Phase 6**: Landing, public pages
6. **Phase 7**: Profile, My Trips, Private Trip

---

## Verification Checklist per Component
- [ ] TypeScript compiles
- [ ] Lint passes (0 errors)
- [ ] Build succeeds
- [ ] Visual review: radius consistent, spacing consistent
- [ ] Accessibility: labels, aria-invalid, focus-visible
- [ ] Dark mode works
- [ ] Responsive: sm/md/lg breakpoints