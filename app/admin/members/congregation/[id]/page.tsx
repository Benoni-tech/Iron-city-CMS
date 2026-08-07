import { notFound } from "next/navigation"
import CongregationForm from "@/components/member-form-congregation"
import { getCongregationMemberById, getLinkedChildren } from "@/lib/firestore"
import FamilyTreeView from "@/components/family-tree-view"
import { getTenantSession } from "@/lib/auth"

interface PageProps { params: Promise<{ id: string }> }

export default async function EditCongregationPage({ params }: PageProps) {
  const { tenantId } = await getTenantSession()
  const { id } = await params
  const member = await getCongregationMemberById(tenantId, id)
  if (!member) notFound()

  const children = await getLinkedChildren(tenantId, id)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="font-display font-bold text-3xl text-[#1a2744] mb-2">
        {member.firstName} {member.surname}
      </h1>
      <p className="text-sm text-stone-400 mb-6">Congregation Member</p>

      <div className="mb-8">
        <FamilyTreeView children={children} parentName={`${member.firstName} ${member.surname}`} />
      </div>

      <CongregationForm mode="edit" memberId={id} initialData={member} />
    </div>
  )
}
