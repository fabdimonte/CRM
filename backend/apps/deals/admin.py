from django.contrib import admin
from .models import Stage, Deal, Task


@admin.register(Stage)
class StageAdmin(admin.ModelAdmin):
    list_display = ('name', 'order', 'is_closed', 'is_won', 'default_probability', 'deals_count')
    list_filter = ('is_closed', 'is_won')
    ordering = ('order',)
    
    def deals_count(self, obj):
        return obj.deals.count()
    deals_count.short_description = 'Deals Count'


@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'owner', 'stage', 'amount_estimate', 
                   'probability', 'is_overdue', 'created_at')
    list_filter = ('stage', 'owner', 'created_at', 'company__sector')
    search_fields = ('title', 'company__name', 'description')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'is_overdue', 'expected_value')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'company', 'owner', 'stage')
        }),
        ('Financial Information', {
            'fields': ('amount_estimate', 'probability', 'expected_value')
        }),
        ('Action Planning', {
            'fields': ('next_action_at', 'description')
        }),
        ('Metadata', {
            'fields': ('is_overdue', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def is_overdue(self, obj):
        return obj.is_overdue
    is_overdue.boolean = True
    is_overdue.short_description = 'Overdue'


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'deal', 'assignee', 'status', 'due_at', 'is_overdue', 'created_at')
    list_filter = ('status', 'assignee', 'created_at')
    search_fields = ('title', 'deal__title', 'description')
    ordering = ('due_at', '-created_at')
    readonly_fields = ('created_at', 'updated_at', 'is_overdue')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'deal')
        }),
        ('Assignment', {
            'fields': ('assignee', 'created_by', 'status', 'due_at')
        }),
        ('Metadata', {
            'fields': ('is_overdue', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def is_overdue(self, obj):
        return obj.is_overdue
    is_overdue.boolean = True
    is_overdue.short_description = 'Overdue'