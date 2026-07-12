import LambForm from "@/components/member-form-lambs"
export default function NewLambPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="font-display font-bold text-3xl text-[#1a2744] mb-2">Register Lamb</h1>
      <p className="text-sm text-stone-400 mb-8">Child aged 4–10</p>
      <LambForm mode="new" />
    </div>
  )
}
