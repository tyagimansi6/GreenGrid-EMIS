from django.db.models import Avg, Count, Max, Sum
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import EnergyLog, Facility
from .serializers import EnergyLogSerializer, FacilitySerializer


class FacilityViewSet(viewsets.ModelViewSet):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer

    @action(detail=True, methods=["get"])
    def stats(self, request, pk=None):
        facility = self.get_object()
        summary = facility.energy_logs.aggregate(
            total_consumption_kwh=Sum("consumption_kwh"),
            average_consumption_kwh=Avg("consumption_kwh"),
            log_count=Count("id"),
            total_cost_estimated=Sum("cost_estimated"),
            last_logged_at=Max("timestamp"),
        )
        total_consumption = summary["total_consumption_kwh"] or 0

        return Response(
            {
                "facility_id": facility.id,
                "facility_name": facility.name,
                "threshold_limit": facility.threshold_limit,
                "total_consumption_kwh": total_consumption,
                "average_consumption_kwh": summary["average_consumption_kwh"] or 0,
                "log_count": summary["log_count"],
                "total_cost_estimated": summary["total_cost_estimated"],
                "last_logged_at": summary["last_logged_at"],
                "over_threshold": total_consumption > facility.threshold_limit,
            }
        )


class EnergyLogViewSet(viewsets.ModelViewSet):
    queryset = EnergyLog.objects.select_related("facility").all()
    serializer_class = EnergyLogSerializer
