from django.contrib import admin
from .models import JobApplication

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ("company", "role", "status", "priority", "applied_date", "updated_at")
    list_filter = ("status", "priority", "applied_date")
    search_fields = ("company", "role", "tags", "notes", "location", "source")
    ordering = ("-applied_date", "-updated_at")
