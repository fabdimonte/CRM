import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { contactsApi } from '@/services/companies-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Plus, Search, Mail, Phone, Building, Linkedin } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import type { Contact } from '@/types'

const seniorityColors = {
  junior: 'bg-green-100 text-green-800 border-green-200',
  mid: 'bg-blue-100 text-blue-800 border-blue-200',
  senior: 'bg-purple-100 text-purple-800 border-purple-200',
  director: 'bg-orange-100 text-orange-800 border-orange-200',
  vp: 'bg-red-100 text-red-800 border-red-200',
  c_level: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

const seniorityLabels = {
  junior: 'Junior',
  mid: 'Mid-Level',
  senior: 'Senior',
  director: 'Director',
  vp: 'VP',
  c_level: 'C-Level',
}

export function Contacts() {
  const [search, setSearch] = useState('')

  const { data: contactsData, isLoading } = useQuery({
    queryKey: ['contacts', { search }],
    queryFn: () => contactsApi.getContacts(search ? { search } : undefined),
  })

  const contacts = contactsData?.results || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your professional contacts and relationships
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      ) : contacts.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No contacts found</h3>
              <p className="text-muted-foreground">
                {search ? 'Try adjusting your search terms.' : 'Start by adding your first contact.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact: Contact) => (
            <Card key={contact.id} className="transition-shadow hover:shadow-md cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(contact.first_name, contact.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-lg">{contact.full_name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${seniorityColors[contact.seniority]}`}
                      >
                        {seniorityLabels[contact.seniority]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {contact.role && (
                  <p className="text-sm font-medium text-muted-foreground">
                    {contact.role}
                  </p>
                )}

                <div className="flex items-center text-sm text-muted-foreground">
                  <Building className="mr-2 h-4 w-4" />
                  <span>{contact.company_name}</span>
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="mr-2 h-4 w-4" />
                  <a 
                    href={`mailto:${contact.email}`}
                    className="hover:text-primary truncate"
                  >
                    {contact.email}
                  </a>
                </div>

                {contact.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="mr-2 h-4 w-4" />
                    <a 
                      href={`tel:${contact.phone}`}
                      className="hover:text-primary"
                    >
                      {contact.phone}
                    </a>
                  </div>
                )}

                {contact.linkedin_url && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Linkedin className="mr-2 h-4 w-4" />
                    <a 
                      href={contact.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary truncate"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}

                {contact.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {contact.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}