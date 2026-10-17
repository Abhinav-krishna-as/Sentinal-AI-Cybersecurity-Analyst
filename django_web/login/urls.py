from django.urls import path
from . import views

urlpatterns = [
    # Login
    path("", views.login_view, name="login"),

    # Logout
    path("logout/", views.logout_view, name="logout"),

    # Session status
    path(
        "session-status/",
        views.session_status,
        name="session_status",
    ),

    # Tab session cleanup
    path(
        "tab-close/",
        views.tab_close,
        name="tab_close",
    ),

    # Dashboard
    path(
        "dashboard/",
        views.dashboard_proxy,
        {"subpath": ""},
        name="dashboard",
    ),
    path(
        "dashboard/<path:subpath>",
        views.dashboard_proxy,
        name="dashboard_subpath",
    ),

    # Dashboard APIs
    path(
        "api/<path:subpath>",
        views.dashboard_api_proxy,
        name="dashboard_api_proxy",
    ),

    # Connector
    path(
        "connector/",
        views.connector_proxy,
        {"subpath": ""},
        name="connector",
    ),
    path(
        "connector/<path:subpath>",
        views.connector_proxy,
        name="connector_subpath",
    ),
]