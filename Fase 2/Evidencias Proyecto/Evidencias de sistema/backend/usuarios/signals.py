from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model


User = get_user_model()


@receiver(post_save, sender=User)
def ensure_staff_sync(sender, instance, **kwargs):
    try:
        group = getattr(instance, 'group', None)
        is_staff = bool(getattr(group, 'is_staff', False)) if group else False
        if instance.is_staff != is_staff:
            sender.objects.filter(pk=instance.pk).update(is_staff=is_staff)
    except Exception:
        pass