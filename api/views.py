import csv
import re

from django.db.models import Avg, Count, Max, Sum
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import EnergyLog, Facility
from .serializers import EnergyLogSerializer, FacilitySerializer


def _alert_level(usage_percent):
    if usage_percent > 100:
        return "critical"
    if usage_percent >= 80:
        return "warning"
    return "normal"


def _usage_percent(total_consumption, threshold_limit):
    if not threshold_limit or threshold_limit <= 0:
        return 100.0 if total_consumption > 0 else 0.0
    return round((total_consumption / threshold_limit) * 100, 2)


def _csv_filename(facility):
    slug = re.sub(r"[^A-Za-z0-9]+", "-", facility.name).strip("-").lower()
    return f"{slug or 'facility'}-energy-report.csv"


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
        threshold_limit = facility.threshold_limit or 0
        usage_percent = _usage_percent(total_consumption, threshold_limit)
        alert_level = _alert_level(usage_percent)
        excess_kwh = max(0, total_consumption - threshold_limit)

        return Response(
            {
                "facility_id": facility.id,
                "facility_name": facility.name,
                "threshold_limit": threshold_limit,
                "total_consumption_kwh": total_consumption,
                "average_consumption_kwh": summary["average_consumption_kwh"] or 0,
                "log_count": summary["log_count"],
                "total_cost_estimated": summary["total_cost_estimated"],
                "last_logged_at": summary["last_logged_at"],
                "over_threshold": alert_level == "critical",
                "threshold_usage_percent": usage_percent,
                "excess_kwh": excess_kwh,
                "alert_level": alert_level,
            }
        )

    @action(detail=True, methods=["get"], url_path="export_csv")
    def export_csv(self, request, pk=None):
        facility = self.get_object()
        logs = facility.energy_logs.order_by("timestamp")
        threshold_limit = facility.threshold_limit or 0
        filename = _csv_filename(facility)

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        response["Access-Control-Expose-Headers"] = "Content-Disposition"

        writer = csv.writer(response)
        writer.writerow(
            ["Timestamp", "Consumption (kWh)", "Estimated Cost", "Alert Status"]
        )

        running_total = 0.0
        for log in logs:
            running_total += log.consumption_kwh or 0
            alert_status = _alert_level(
                _usage_percent(running_total, threshold_limit)
            )
            writer.writerow(
                [
                    log.timestamp.isoformat(),
                    log.consumption_kwh,
                    log.cost_estimated if log.cost_estimated is not None else "",
                    alert_status,
                ]
            )

        return response


class EnergyLogViewSet(viewsets.ModelViewSet):
    queryset = EnergyLog.objects.select_related("facility").all()
    serializer_class = EnergyLogSerializer
