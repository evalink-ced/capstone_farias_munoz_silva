def parse_bool(val, default=None):
    if val is None:
        return default
    v = str(val).lower()
    if v in ("true", "1", "t", "yes", "y"):  return True
    if v in ("false", "0", "f", "no", "n"):  return False
    return default