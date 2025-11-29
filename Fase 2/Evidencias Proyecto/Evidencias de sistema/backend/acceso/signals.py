from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from acceso.models import AccessPermission


@receiver(post_save, sender=AccessPermission)
def sync_user_staff_on_permission_change(sender, instance, **kwargs):
    User = get_user_model()
    User.objects.filter(group=instance).update(is_staff=instance.is_staff)