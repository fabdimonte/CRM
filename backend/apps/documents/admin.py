from django.contrib import admin
from .models import Document, NDA


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('filename', 'deal', 'size_human', 'content_type', 'uploaded_by', 'uploaded_at')
    list_filter = ('content_type', 'uploaded_by', 'uploaded_at')
    search_fields = ('filename', 'deal__title')
    ordering = ('-uploaded_at',)
    readonly_fields = ('size', 'content_type', 'uploaded_at', 'size_human', 'file_extension')
    
    fieldsets = (
        ('File Information', {
            'fields': ('filename', 'file', 'size_human', 'content_type', 'file_extension')
        }),
        ('Association', {
            'fields': ('deal', 'uploaded_by')
        }),
        ('Metadata', {
            'fields': ('uploaded_at',),
            'classes': ('collapse',)
        }),
    )
    
    def size_human(self, obj):
        return obj.size_human
    size_human.short_description = 'Size'


@admin.register(NDA)
class NDAAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'counterparty', 'status', 'signed_at', 'file', 'created_at')
    list_filter = ('counterparty', 'status', 'signed_at', 'created_at')
    search_fields = ('deal__title', 'notes')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('deal', 'counterparty', 'status')
        }),
        ('Signing Information', {
            'fields': ('signed_at', 'file', 'notes')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )