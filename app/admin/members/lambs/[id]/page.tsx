import { notFound } from "next/navigation"
import LambForm from "@/components/member-form-lambs"
import { getLambById } from "@/lib/firestore"

interface PageProps { params: Promise<{ id: string }> }

export default async function EditLambPage({ params }: PageProps) {
  const { id } = await params
  const lamb = await getLambById(id)
  if (!lamb) notFound()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="font-display font-bold text-3xl text-[#1a2744] mb-2">
        {lamb.firstName} {lamb.surname}
      </h1>
      <p className="text-sm text-stone-400 mb-8">Lamb · Age {new Date().getFullYear() - new Date(lamb.dateOfBirth).getFullYear()}</p>
      <LambForm mode="edit" lambId={id} initialData={lamb} />
    </div>
  )
}
