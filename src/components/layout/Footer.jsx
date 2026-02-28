import { DollarSign } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 px-4 md:px-6 py-2.5 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
          <DollarSign className="w-3 h-3 text-white" />
        </div>
        <span className="text-xs font-semibold text-gray-500">BudgetWise</span>
      </div>
      <span className="text-xs text-gray-400">© {new Date().getFullYear()} All rights reserved</span>
    </footer>
  )
}
