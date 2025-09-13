from django.contrib import admin
from .models import Interaction


@admin.register(Interaction)
class InteractionAdmin(admin.ModelAdmin):
    list_display = ('subject', 'type', 'related_entity', 'author', 'occurred_at', 'created_at')
    list_filter = ('type', 'occurred_at', 'author', 'created_at')
    search_fields = ('subject', 'body', 'deal__title', 'company__name', 'contact__first_name', 'contact__last_name')
    ordering = ('-occurred_at',)
    readonly_fields = ('created_at', 'updated_at', 'related_entity')
    
    fieldsets = (
        ('Association', {
            'fields': ('deal', 'company', 'contact', 'related_entity'),
            'description': 'Associate with either a deal or company/contact'
        }),
        ('Interaction Details', {
            'fields': ('type', 'subject', 'body', 'occurred_at', 'author')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def related_entity(self, obj):
        return obj.related_entity
    related_entity.short_description = 'Related To'