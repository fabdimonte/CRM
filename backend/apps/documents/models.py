import os
import magic
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


def document_upload_path(instance, filename):
    """
    Upload path: documents/<deal_id|general>/<filename>
    Si le document est rattaché à un deal, on utilise son id, sinon 'general'.
    """
    return f"documents/{instance.deal.id if instance.deal else 'general'}/{filename}"


class Document(models.Model):
    deal = models.ForeignKey(
        'deals.Deal',
        on_delete=models.CASCADE,
        related_name='documents',
        null=True,
        blank=True,
    )
    filename = models.CharField(max_length=255)
    file = models.FileField(upload_to=document_upload_path)
    size = models.PositiveIntegerField(help_text="File size in bytes")
    content_type = models.CharField(max_length=100)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='uploaded_documents',
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.filename

    def save(self, *args, **kwargs):
        """
        À chaque sauvegarde:
        - Met à jour filename à partir de file.name
        - Calcule size (avec fallback si .size indisponible)
        - Détecte content_type via python-magic (fallback application/octet-stream)
        """
        if self.file:
            # Nom de fichier stocké
            self.filename = self.file.name

            # Taille du fichier
            try:
                size = getattr(self.file, 'size', None)
                if size is None:
                    # Fallback si le backend ne remplit pas .size
                    self.file.seek(0, os.SEEK_END)
                    size = self.file.tell()
                    self.file.seek(0)
                self.size = size
            except Exception:
                self.size = 0

            # Type MIME
            try:
                head = self.file.read(1024)
                self.content_type = magic.from_buffer(head, mime=True) or 'application/octet-stream'
                self.file.seek(0)
            except Exception:
                self.content_type = 'application/octet-stream'

        super().save(*args, **kwargs)

    @property
    def file_extension(self):
        """Extension du fichier (avec le point)."""
        return os.path.splitext(self.filename)[1].lower()

    @property
    def size_human(self):
        """Taille lisible humainement."""
        size = self.size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"


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
        related_name='ndas',
    )
    counterparty = models.CharField(max_length=20, choices=COUNTERPARTY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    signed_at = models.DateTimeField(null=True, blank=True)

    # IMPORTANT: le champ s’appelle file et pointe vers Document
    file = models.ForeignKey(
        Document,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='nda_references',
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
        """
        Règles métier:
        - Si status = 'signed', alors un fichier (Document) doit être associé
        - Si status = 'signed', une date signed_at doit être renseignée
        """
        if self.status == 'signed' and not self.file:
            raise ValidationError('Signed NDA must have an associated document')
        if self.status == 'signed' and not self.signed_at:
            raise ValidationError('Signed NDA must have a signed date')

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
