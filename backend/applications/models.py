import uuid
from django.db import models

class JobApplication(models.Model):
    class Status(models.TextChoices):
        SAVED = "Saved", "Saved"
        APPLIED = "Applied", "Applied"
        INTERVIEW = "Interview", "Interview"
        OFFER = "Offer", "Offer"
        REJECTED = "Rejected", "Rejected"
        GHOSTED = "Ghosted", "Ghosted"

    class Priority(models.TextChoices):
        LOW = "Low", "Low"
        MEDIUM = "Medium", "Medium"
        HIGH = "High", "High"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    job_url = models.URLField(blank=True)
    source = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SAVED)
    stage = models.CharField(max_length=100, blank=True)
    salary = models.CharField(max_length=100, blank=True)
    applied_date = models.DateField(null=True, blank=True)
    follow_up_date = models.DateField(null=True, blank=True)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    resume_version = models.CharField(max_length=100, blank=True)
    tags = models.CharField(max_length=255, blank=True)  # comma-separated for v1
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-applied_date", "-updated_at"]

    def __str__(self):
        return f"{self.company} — {self.role}"
