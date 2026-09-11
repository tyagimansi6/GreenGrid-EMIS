from django.db import models


class Facility(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    total_area = models.FloatField(help_text="Total area in sq ft")
    threshold_limit = models.FloatField(help_text="Max kWh allowed")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class EnergyLog(models.Model):
    facility = models.ForeignKey(
        Facility,
        on_delete=models.CASCADE,
        related_name="energy_logs",
    )
    timestamp = models.DateTimeField()
    consumption_kwh = models.FloatField()
    cost_estimated = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
    )

    def __str__(self):
        return f"{self.facility.name} - {self.timestamp}"
