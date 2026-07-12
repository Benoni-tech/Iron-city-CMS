import Link from "next/link"

interface LinkedChild {
  id: string
  name: string
  category: "lambs" | "teens"
  dob: string
}

interface FamilyTreeViewProps {
  children: LinkedChild[]
  parentName: string
}

export default function FamilyTreeView({ children, parentName }: FamilyTreeViewProps) {
  if (children.length === 0) {
    return (
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
        <p className="text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-2">
          Family
        </p>
        <p className="text-sm text-stone-400 italic">
          No children linked to this member yet. Link from a Lamb or Teen registration form.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
      <p className="text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-3">
        Family — Children of {parentName}
      </p>
      <ul className="space-y-2">
        {children.map((child) => (
          <li key={child.id}>
            <Link
              href={`/admin/members/${child.category}/${child.id}`}
              className="flex items-center justify-between px-3 py-2.5 bg-white border border-stone-200 rounded-lg hover:border-[#1a2744] transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-stone-900">{child.name}</p>
                <p className="text-xs text-stone-400">{child.dob}</p>
              </div>
              <span className={`status-badge badge-${child.category}`}>
                {child.category === "lambs" ? "Lamb" : "Teen"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
