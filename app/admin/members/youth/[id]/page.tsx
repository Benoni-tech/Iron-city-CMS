import { notFound } from "next/navigation"
import YouthForm from "@/components/member-form-youth"
import { getYouthById, getLinkedChildren } from "@/lib/firestore"
import FamilyTreeView from "@/components/family-tree-view"

interface PageProps { params: Promise<{ id: string }> }

export default async function EditYouthPage({ params }: PageProps) {
  const { id } = await params
  const member = await getYouthById(id)
  if (!member) notFound()

  const children = await getLinkedChildren(id)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="font-display font-bold text-3xl text-[#1a2744] mb-2">
        {member.firstName} {member.surname}
      </h1>
      <p className="text-sm text-stone-400 mb-6">Youth · {member.educationLevel}</p>

      <div className="mb-8">
        <FamilyTreeView children={children} parentName={`${member.firstName} ${member.surname}`} />
      </div>

      <YouthForm mode="edit" youthId={id} initialData={member} />
    </div>
  )
}
