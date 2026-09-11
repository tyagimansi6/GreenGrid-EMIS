from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import EnergyLogViewSet, FacilityViewSet

router = DefaultRouter()
router.register(r"facilities", FacilityViewSet)
router.register(r"energy-logs", EnergyLogViewSet)

# CSV export: GET /api/facilities/{id}/export_csv/
urlpatterns = [
    path("", include(router.urls)),
]
