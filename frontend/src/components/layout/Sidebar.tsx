import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { 
  Building, 
  Users, 
  MessageCircle, 
  CheckSquare, 
  FileText, 
  Shield,
  BarChart3,
  Home
} from 'lucide-react'

const navigation = [
  {
    name: 'Pipeline',
    href: '/pipeline',
    icon: BarChart3,
  },
  {
    name: 'Companies',
    href: '/companies',
    icon: Building,
  },
  {
    name: 'Contacts',
    href: '/contacts',
    icon: Users,
  },
  {
    name: 'Interactions',
    href: '/interactions',
    icon: MessageCircle,
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    name: 'Documents',
    href: '/documents',
    icon: FileText,
  },
  {
    name: 'NDAs',
    href: '/ndas',
    icon: Shield,
  },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <Home className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">M&A CRM</h1>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}