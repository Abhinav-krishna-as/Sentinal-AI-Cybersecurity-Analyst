from django.db import models


class ActiveApplicationSession(models.Model):
    # Multiple tabs can belong to the same registered application.
    application_id = models.CharField(
        max_length=100,
        db_index=True,
    )

    # Several tabs may share the same Django browser session.
    session_key = models.CharField(
        max_length=100,
        blank=True,
        default="",
        db_index=True,
    )

    # Store the hash, never the raw tab authentication token.
    tab_token_hash = models.CharField(
        max_length=64,
        unique=True,
        null=True,
        blank=True,
    )

    # Automatically expires inactive tab sessions.
    expires_at = models.DateTimeField(
        db_index=True,
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"{self.application_id} - Tab Session"