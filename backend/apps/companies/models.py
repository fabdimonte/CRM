from django.db import models
from django.core.validators import RegexValidator, URLValidator


class Company(models.Model):
    name = models.CharField(max_length=255)
    legal_id = models.CharField(
        max_length=50, 
        unique=True,
        help_text="SIREN number or similar legal identifier",
        validators=[RegexValidator(r'^[A-Za-z0-9]+$', 'Legal ID must be alphanumeric')]
    )
    country = models.CharField(max_length=100)
    website = models.URLField(blank=True, validators=[URLValidator()])
    sector = models.CharField(max_length=100)
    size = models.CharField(
        max_length=20,
        choices=[
            ('startup', 'Startup'),
            ('small', 'Small (1-50)'),
            ('medium', 'Medium (51-250)'),
            ('large', 'Large (251-1000)'),
            ('enterprise', 'Enterprise (1000+)'),
        ],
        default='medium'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'companies'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def contacts_count(self):
        return self.contacts.count()
    
    @property
    def deals_count(self):
        return self.deals.count()


class Contact(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='contacts')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=100, blank=True)
    seniority = models.CharField(
        max_length=20,
        choices=[
            ('junior', 'Junior'),
            ('mid', 'Mid'),
            ('senior', 'Senior'),
            ('director', 'Director'),
            ('vp', 'VP'),
            ('c_level', 'C-Level'),
        ],
        default='mid'
    )
    linkedin_url = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['last_name', 'first_name']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.company.name})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()