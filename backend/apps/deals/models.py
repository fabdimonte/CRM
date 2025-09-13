from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Stage(models.Model):
    name = models.CharField(max_length=100, unique=True)
    order = models.PositiveIntegerField(unique=True)
    is_closed = models.BooleanField(default=False)
    is_won = models.BooleanField(default=False)
    default_probability = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(1)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return self.name


class Deal(models.Model):
    title = models.CharField(max_length=255)
    company = models.ForeignKey(
        'companies.Company', 
        on_delete=models.CASCADE, 
        related_name='deals'
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='owned_deals'
    )
    stage = models.ForeignKey(Stage, on_delete=models.PROTECT, related_name='deals')
    amount_estimate = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Estimated deal value"
    )
    probability = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        help_text="Probability of closing (0.0 to 1.0)"
    )
    next_action_at = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="When the next action is due"
    )
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.company.name}"
    
    @property
    def is_overdue(self):
        """Check if next action is overdue"""
        if not self.next_action_at:
            return False
        return timezone.now() > self.next_action_at
    
    @property
    def expected_value(self):
        """Calculate expected value (amount * probability)"""
        if not self.amount_estimate:
            return None
        return self.amount_estimate * self.probability
    
    def save(self, *args, **kwargs):
        # Set default probability from stage if not explicitly set
        if self._state.adding and hasattr(self, 'stage') and self.stage:
            if self.probability == 0.00:  # Only if not explicitly set
                self.probability = self.stage.default_probability
        super().save(*args, **kwargs)


class Task(models.Model):
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('doing', 'Doing'),
        ('done', 'Done'),
    ]
    
    deal = models.ForeignKey(
        Deal, 
        on_delete=models.CASCADE, 
        related_name='tasks',
        null=True, 
        blank=True
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='assigned_tasks'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='created_tasks'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['due_at', '-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def is_overdue(self):
        """Check if task is overdue"""
        if not self.due_at or self.status == 'done':
            return False
        return timezone.now() > self.due_at