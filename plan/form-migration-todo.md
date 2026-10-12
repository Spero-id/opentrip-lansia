# 📋 Form Migration TODO

**Total native form elements to migrate: ~400**

---

## ✅ Done
- [x] ShadCN UI library setup (Button, Input, Textarea, Select, Checkbox, RadioGroup, Switch, Label, FormField, FormSection)
- [x] Button size variants (xs, sm, default, lg, xl, icon-xs, icon-sm, icon-lg)
- [x] Contact page submit button → `<Button>` (size=default, variant=primary, h-auto)
- [x] Design tokens: `--radius: 0.25rem`, `--primary: #F49D1A`, `--muted-foreground: #64748B`

---

## ✅ Phase 1: Auth Pages (DONE 2026-10-12, branch `feat/form-migration`)
| File | Elements | Target |
|---|---|---|
| `src/app/(auth)/login/page.tsx` | 0 native ✅ | `<Button size="lg" className="w-full">`, `<Input>`, password-toggle `<Button variant="ghost" size="icon-sm">`, `<Checkbox id="remember-me">` + `<Label>` |
| `src/app/(auth)/register/page.tsx` | 0 native ✅ | `<Button size="lg" className="w-full">`, `<Input>`, password-toggle `<Button variant="ghost" size="icon-sm">`, `<Checkbox id="terms">` + `<Label>` |

---

## 🟠 Phase 2: Public Pages (User-Facing)
| File | Elements | Target |
|---|---|---|
| `src/app/(public)/contact/page.tsx` | 1 `<button>`, 4 `<input>`, 1 `<textarea>` | Already partially done, complete migration |
| `src/app/(public)/checkout/page.tsx` | 1 `<button>`, 15 `<input>`, 2 `<select>` | Full migration |
| `src/app/(public)/blog/page.tsx` | 2 `<button>` | `<Button variant="ghost" size="sm">` |
| `src/app/(public)/blog/[slug]/page.tsx` | - | Check |

---

## 🟡 Phase 3: Checkout Components (High Conversion)
| File | Elements | Target |
|---|---|---|
| `src/features/checkout/components/CustomerForm.tsx` | 1 `<button>`, 8 `<input>`, 2 `<textarea>` | `<FormField>` + `<Button>` |
| `src/features/checkout/components/ParticipantCard.tsx` | 1 `<button>`, 5 `<input>`, 1 `<select>` | `<Button variant="ghost">`, `<Input>`, `<Select>` |
| `src/features/checkout/components/PaymentStep.tsx` | 4 `<button>`, 2 `<input>` | `<Button>`, `<Input>` |
| `src/features/checkout/components/PriceBreakdown.tsx` | 3 `<button>`, 1 `<input>` | `<Button>`, `<Input>` |
| `src/features/checkout/components/ReferralInput.tsx` | 2 `<button>`, 1 `<input>` | `<Button>`, `<Input>` |
| `src/features/checkout/components/TierSelector.tsx` | 2 `<button>` | `<Button variant="outline" size="sm">` |
| `src/features/checkout/components/VoucherCard.tsx` | 2 `<button>`, 1 `<input>` | `<Button>`, `<Input>` |
| `src/features/checkout/components/TermsModal.tsx` | 2 `<button>` | `<Button>`, `<Button variant="outline">` |

---

## 🟢 Phase 4: Admin Forms (CRUD - Volume Terbesar)
| File | Elements | Target |
|---|---|---|
| `src/app/(admin)/admin/bookings/page.tsx` | 9 `<button>`, 5 `<input>`, 2 `<select>`, 2 `<textarea>` | Full `<FormField>` + `<Button>` |
| `src/app/(admin)/admin/trips/page.tsx` | 11 `<button>`, 8 `<input>`, 2 `<select>`, 1 `<textarea>` | Full `<FormField>` |
| `src/app/(admin)/admin/trips/[id]/groups/page.tsx` | 23 `<button>`, 11 `<input>`, 1 `<select>` | `<Button size="icon">`, `<Input>`, `<Select>` |
| `src/app/(admin)/admin/blogs/page.tsx` | 5 `<button>`, 6 `<input>`, 1 `<select>`, 1 `<textarea>` | Full `<FormField>` |
| `src/app/(admin)/admin/commissions/page.tsx` | 5 `<button>`, 4 `<input>`, 1 `<select>` | Full `<FormField>` |
| `src/app/(admin)/admin/horeca/page.tsx` | 5 `<button>`, 6 `<input>`, 2 `<select>`, 1 `<textarea>` | Full `<FormField>` |
| `src/app/(admin)/admin/meeting-points/page.tsx` | 5 `<button>`, 4 `<input>`, 1 `<select>`, 1 `<textarea>` | Full `<FormField>` |
| `src/app/(admin)/admin/private-trips/page.tsx` | 3 `<button>`, 2 `<input>` | `<Button>`, `<Input>` |
| `src/app/(admin)/admin/private-trips/[id]/page.tsx` | 9 `<button>`, 3 `<input>`, 3 `<textarea>` | Full `<FormField>` |
| `src/app/(admin)/admin/promotions/page.tsx` | 5 `<button>`, 7 `<input>`, 1 `<select>`, 1 `<textarea>` | Full `<FormField>` |
| `src/app/(admin)/admin/users/page.tsx` | 4 `<button>`, 4 `<input>`, 2 `<select>` | `<Button>`, `<Input>`, `<Select>` |
| `src/app/(admin)/admin/vendors/page.tsx` | 5 `<button>`, 7 `<input>`, 1 `<select>`, 1 `<textarea>` | Full `<FormField>` |
| `src/app/(admin)/admin/trips/image-manager.tsx` | 3 `<button>` | `<Button size="icon">` |
| `src/app/(admin)/admin/components/icon-picker.tsx` | 9 `<button>` | `<Button size="icon">` |
| `src/app/(admin)/admin/components/confirm-action.tsx` | 2 `<button>` | `<Button variant="primary">`, `<Button variant="outline">` |
| `src/app/(admin)/admin/components/confirm-delete.tsx` | 2 `<button>` | `<Button variant="destructive">`, `<Button variant="outline">` |
| `src/app/(admin)/admin/components/cover-image-uploader.tsx` | 2 `<button>` | `<Button size="icon">` |
| `src/app/(admin)/admin/components/blog-cover-uploader.tsx` | 3 `<button>` | `<Button size="icon">` |

---

## 🔵 Phase 5: Feature Components (User-Facing)
| File | Elements | Target |
|---|---|---|
| `src/features/my-trips/components/OpenTripBookingCard.tsx` | 3 `<button>` | `<Button size="icon">` |
| `src/features/my-trips/components/RequestCard.tsx` | 2 `<button>` | `<Button size="icon">` |
| `src/features/my-trips/components/ProposalCard.tsx` | 4 `<button>` | `<Button variant="primary/secondary/destructive" size="sm">` |
| `src/features/my-trips/components/FeedbackModal.tsx` | 3 `<button>`, 1 `<textarea>` | `<Button>`, `<Textarea>` |
| `src/features/my-trips/components/GalleryModal.tsx` | 2 `<button>` | `<Button size="icon">` |
| `src/features/private-trip/components/TermsModal.tsx` | 3 `<button>`, 3 `<input>`, 2 `<textarea>` | Full `<FormField>` |
| `src/features/private-trip/components/TripDetailSection.tsx` | 1 `<button>`, 4 `<input>`, 1 `<textarea>` | `<Button>`, `<Input>`, `<Textarea>` |
| `src/features/private-trip/components/SubmitBar.tsx` | 1 `<button>` | `<Button size="lg" className="w-full">` |
| `src/features/private-trip/components/SuccessState.tsx` | 1 `<button>` | `<Button size="lg" className="w-full">` |
| `src/features/private-trip/components/DestinationCard.tsx` | 1 `<button>` | `<Button size="icon">` |
| `src/features/private-trip/components/DestinationModal.tsx` | 1 `<button>`, 1 `<input>` | `<Button size="icon">`, `<Input>` |
| `src/features/private-trip/components/TripFromSection.tsx` | 1 `<input>` | `<Input>` |
| `src/features/private-trip/components/TripOptionSection.tsx` | 1 `<input>` | `<Input>` |
| `src/features/private-trip/components/BookingInformationSection.tsx` | 4 `<input>`, 2 `<textarea>` | `<Input>`, `<Textarea>` |
| `src/features/private-trip/components/FacilitiesSection.tsx` | 4 `<input>`, 1 `<select>`, 1 `<textarea>` | `<Input>`, `<Select>`, `<Textarea>` |
| `src/features/private-trip/components/SelectedDestination.tsx` | 1 `<button>` | `<Button size="icon">` |
| `src/features/trip/components/FilterPanel.tsx` | 10 `<button>`, 2 `<input>`, 1 `<select>` | `<Button size="icon/sm">`, `<Input>`, `<Select>` |
| `src/features/trip/components/SearchBar.tsx` | 3 `<button>`, 1 `<input>` | `<Button size="icon/sm">`, `<Input>` |
| `src/features/trip/components/detail/BookingCard.tsx` | 2 `<button>` | `<Button size="icon">` |
| `src/features/trip/components/detail/DestinationGallery.tsx` | 2 `<button>` | `<Button size="icon">` |
| `src/features/trip/components/detail/DestinationTabs.tsx` | 1 `<button>` | `<Button size="icon">` |
| `src/features/trip/components/detail/Lightbox.tsx` | 4 `<button>` | `<Button size="icon">` |
| `src/features/trip/components/detail/BookingCard.tsx` | 2 `<button>` | `<Button size="icon">` |
| `src/features/trip/components/ResultsBar.tsx` | 1 `<button>` | `<Button>` |
| `src/features/trip/components/EmptyState.tsx` | 1 `<button>` | `<Button>` |
| `src/features/landing/components/HeroSection.tsx` | 1 `<button>`, 1 `<input>` | `<Button size="xl">`, `<Input size="lg">` |
| `src/features/landing/components/DestinationSection.tsx` | 4 `<button>` | `<Button size="icon">` |
| `src/features/landing/components/FAQSection.tsx` | 4 `<button>` | `<Button variant="ghost" size="icon">` |
| `src/features/landing/components/TestimonialsSection.tsx` | 3 `<button>` | `<Button size="icon">` |
| `src/features/landing/components/MarketingSection.tsx` | 1 `<button>` | `<Button>` |
| `src/features/checkout/components/PriceBreakdown.tsx` | 3 `<button>`, 1 `<input>` | `<Button>`, `<Input>` |
| `src/features/checkout/components/ReferralInput.tsx` | 2 `<button>`, 1 `<input>` | `<Button>`, `<Input>` |
| `src/features/checkout/components/VoucherCard.tsx` | 2 `<button>`, 1 `<input>` | `<Button>`, `<Input>` |
| `src/features/newsletter/components/Subs.tsx` | 3 `<button>`, 1 `<input>` | `<Button>`, `<Input>` |
| `src/features/profile/components/ReferralCard.tsx` | 3 `<button>` | `<Button>` |
| `src/features/profile/components/ReferralHistory.tsx` | 3 `<button>` | `<Button>` |
| `src/features/profile/components/LogoutButton.tsx` | 1 `<button>` | `<Button variant="outline">` |

---

## 📦 Phase 6: Layout & UI Components
| File | Elements | Target |
|---|---|---|
| `src/components/layout/Navbar.tsx` | 3 `<button>` | `<Button size="icon" variant="ghost">` |
| `src/components/layout/MobileMenu.tsx` | 2 `<button>` | `<Button size="icon" variant="ghost">` |
| `src/components/ui/sidebar.tsx` | 1 `<button>` | `<Button size="icon" variant="ghost">` |
| `src/components/layout/Footer.tsx` | - | Check |

---

## 📋 Summary

| Phase | Files | Native Buttons | Native Inputs | Native Selects | Native Textareas | Est. Effort |
|---|---:|---:|---:|---:|---:|---|
| 1. Auth | 2 | 6 | 7 | 0 | 0 | 1 jam |
| 2. Public | 3 | 3 | 15 | 2 | 1 | 2 jam |
| 3. Checkout | 8 | 14 | 16 | 3 | 2 | 3 jam |
| 4. Admin | 18 | 76 | 55 | 8 | 7 | 8 jam |
| 5. Features | 30 | 58 | 28 | 4 | 6 | 6 jam |
| 6. Layout | 3 | 4 | 0 | 0 | 0 | 0.5 jam |
| **TOTAL** | **~61** | **~150** | **~122** | **16** | **15** | **~21.5 jam** |

---

## 🎯 Next Action
Phase 1 DONE ✅ — lanjut **Phase 2: Public Pages** (`checkout/page.tsx` 1 button/15 input/2 select, `blog/page.tsx` 2 button).