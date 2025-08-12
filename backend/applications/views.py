from rest_framework import viewsets, filters
from .models import JobApplication
from .serializers import JobApplicationSerializer

class JobApplicationViewSet(viewsets.ModelViewSet):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer

    # search by these fields using ?search=...
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["company", "role", "location", "source", "stage", "tags", "notes"]

    # allow filtering via query params (?status=Applied&priority=High&applied_date__gte=2025-08-01)
    from django_filters.rest_framework import DjangoFilterBackend  # optional import if you prefer, but not required
    filterset_fields = {
        "status": ["exact"],
        "priority": ["exact"],
        "applied_date": ["gte", "lte"],
        "follow_up_date": ["gte", "lte"],
    }

    # sorting with ?ordering=-applied_date or ?ordering=company
    ordering_fields = ["applied_date", "company", "role", "priority", "status", "updated_at", "created_at"]
    ordering = ["-applied_date", "-updated_at"]
