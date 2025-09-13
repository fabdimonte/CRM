import os
import magic
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


def document_upload_path(instance, filename):
    """Generate upload path for documents"""
    return f"documents/{instance.deal.id if instance.deal else 'general'}/{filename}"


class Document(models.Model):
    deal = models.ForeignKey(
        'deals.Deal', 
        on_delete=models.CASCADE, 
        related_name='documents',
        null=True, 
        blank=True
    )
    filename = models.CharField(max_length=255)
    file = models.FileField(upload_to=document_upload_path)
    size = models.PositiveIntegerField(help_text="File size in bytes")
    content_type = models.CharField(max_length=100)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='uploaded_documents'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return self.filename
    
    def save(self, *args, **kwargs):
        if self.file:
            self.filename = self.file.name
            self.size = self.file.size
            
            # Detect content type using python-magic
            try:
                self.content_type = magic.from_buffer(self.file.read(1024), mime=True)
                self.file.seek(0)  # Reset file pointer
            except:
                # Fallback to file extension-based detection
                self.content_type = 'application/octet-stream'
        
        super().save(*args, **kwargs)
    
    @property
    def file_extension(self):
        """Get file extension"""
        return os.path.splitext(self.filename)[1].lower()
    
    @property
    def size_human(self):
        """Human-readable file size"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if self.size < 1024.0:
                return f"{self.size:.1f} {unit}"
            self.size /= 1024.0
        return f"{self.size:.1f} TB"


class NDA(models.Model):
    COUNTERPARTY_CHOICES = [
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
        ('target', 'Target'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('signed', 'Signed'),
    ]
    
    deal = models.ForeignKey(
        'deals.Deal', 
        on_delete=models.CASCADE, 
        related_name='ndas'
    )
    counterparty = models.CharField(max_length=20, choices=COUNTERPARTY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    signed_at = models.DateTimeField(null=True, blank=True)
    file = models.ForeignKey(
        Document, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='nda_references'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'NDA'
        verbose_name_plural = 'NDAs'
    
    def __str__(self):
        return f"NDA - {self.deal.title} ({self.get_counterparty_display()})"
    
    def clean(self):
        """Model validation"""
        if self.status == 'signed' and not self.file:
            raise ValidationError('Signed NDA must have an associated document')
        
        if self.status == 'signed' and not self.signed_at:
            raise ValidationError('Signed NDA must have a signed date')
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)