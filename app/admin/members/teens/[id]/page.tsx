import { notFound } from "next/navigation"
import TeenForm from "@/components/member-form-teens"
import { getTeenById } from "@/lib/firestore"

interface PageProps { params: Promise<{ id: string }> }

export default async function EditTeenPage({ params }: PageProps) {
  const { id } = await params
  const teen = await getTeenById(id)
  if (!teen) notFound()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="font-display font-bold text-3xl text-[#1a2744] mb-2">
        {teen.firstName} {teen.surname}
      </h1>
      <p className="text-sm text-stone-400 mb-8">Teen · Age {new Date().getFullYear() - new Date(teen.dateOfBirth).getFullYear()}</p>
      <TeenForm mode="edit" teenId={id} initialData={teen} />
    </div>
  )
}
