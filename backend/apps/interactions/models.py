from django.db import models
from django.conf import settings


class Interaction(models.Model):
    TYPE_CHOICES = [
        ('email', 'Email'),
        ('call', 'Phone Call'),
        ('meeting', 'Meeting'),
        ('note', 'Note'),
    ]
    
    # Can be associated with either a deal or a company/contact directly
    deal = models.ForeignKey(
        'deals.Deal', 
        on_delete=models.CASCADE, 
        related_name='interactions',
        null=True, 
        blank=True
    )
    company = models.ForeignKey(
        'companies.Company', 
        on_delete=models.CASCADE, 
        related_name='interactions',
        null=True, 
        blank=True
    )
    contact = models.ForeignKey(
        'companies.Contact', 
        on_delete=models.CASCADE, 
        related_name='interactions',
        null=True, 
        blank=True
    )
    
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    subject = models.CharField(max_length=255)
    body = models.TextField()
    occurred_at = models.DateTimeField()
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='authored_interactions'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-occurred_at']
    
    def __str__(self):
        return f"{self.get_type_display()}: {self.subject}"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        # Must be associated with either deal or company/contact
        if not self.deal and not self.company and not self.contact:
            raise ValidationError('Interaction must be associated with either a deal or company/contact')
        
        # If associated with contact, should also have company
        if self.contact and not self.company:
            self.company = self.contact.company
    
    @property
    def related_entity(self):
        """Get the primary related entity for display purposes"""
        if self.deal:
            return f"Deal: {self.deal.title}"
        elif self.contact:
            return f"Contact: {self.contact.full_name}"
        elif self.company:
            return f"Company: {self.company.name}"
        return "Unknown"