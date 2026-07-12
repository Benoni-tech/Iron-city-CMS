import TeenForm from "@/components/member-form-teens"
export default function NewTeenPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="font-display font-bold text-3xl text-[#1a2744] mb-2">Register Teen</h1>
      <p className="text-sm text-stone-400 mb-8">Child aged 11–16</p>
      <TeenForm mode="new" />
    </div>
  )
}
