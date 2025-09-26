from django.contrib.auth.decorators import user_passes_test

def admin_permission_required(view_func):
    actual_decorator = user_passes_test(
        lambda u: u.is_active and u.is_staff,
        login_url='index',
    )
    if view_func:
        return actual_decorator(view_func)
    return actual_decorator

