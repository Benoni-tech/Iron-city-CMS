import CongregationForm from "@/components/member-form-congregation"
export default function NewCongregationPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="font-display font-bold text-3xl text-[#1a2744] mb-2">Register Congregation Member</h1>
      <p className="text-sm text-stone-400 mb-8">Adult / main church member</p>
      <CongregationForm mode="new" />
    </div>
  )
}
