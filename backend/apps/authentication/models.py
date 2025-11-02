import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    커스텀 사용자 모델
    Django 기본 User 모델을 확장하여 is_admin 필드 추가
    docs/database.md 2.1 참고
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    is_admin = models.BooleanField(
        default=False,
        help_text="관리자 권한 여부"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        constraints = [
            models.UniqueConstraint(
                fields=['username'],
                name='unique_username'
            ),
        ]
        indexes = [
            models.Index(fields=['username'], name='idx_users_username'),
        ]

    def __str__(self):
        return self.username
