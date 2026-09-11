from rest_framework import serializers

from .models import EnergyLog, Facility


class FacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Facility
        fields = "__all__"


class EnergyLogSerializer(serializers.ModelSerializer):
    facility_detail = FacilitySerializer(source="facility", read_only=True)

    class Meta:
        model = EnergyLog
        fields = [
            "id",
            "facility",
            "facility_detail",
            "timestamp",
            "consumption_kwh",
            "cost_estimated",
        ]
