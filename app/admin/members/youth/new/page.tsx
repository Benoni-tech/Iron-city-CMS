import YouthForm from "@/components/member-form-youth"
export default function NewYouthPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="font-display font-bold text-3xl text-[#1a2744] mb-2">Register Youth</h1>
      <p className="text-sm text-stone-400 mb-8">SHS or University student</p>
      <YouthForm mode="new" />
    </div>
  )
}
