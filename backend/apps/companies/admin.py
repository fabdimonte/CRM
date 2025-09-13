from django.contrib import admin
from .models import Company, Contact


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'legal_id', 'country', 'sector', 'size', 'contacts_count', 'deals_count', 'created_at')
    list_filter = ('country', 'sector', 'size', 'created_at')
    search_fields = ('name', 'legal_id', 'sector')
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at', 'contacts_count', 'deals_count')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'legal_id', 'country', 'website')
        }),
        ('Business Information', {
            'fields': ('sector', 'size', 'notes')
        }),
        ('Metadata', {
            'fields': ('contacts_count', 'deals_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'role', 'seniority', 'company', 'created_at')
    list_filter = ('seniority', 'company__sector', 'created_at')
    search_fields = ('first_name', 'last_name', 'email', 'company__name')
    ordering = ('last_name', 'first_name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'email', 'phone')
        }),
        ('Professional Information', {
            'fields': ('company', 'role', 'seniority', 'linkedin_url')
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = 'Name'