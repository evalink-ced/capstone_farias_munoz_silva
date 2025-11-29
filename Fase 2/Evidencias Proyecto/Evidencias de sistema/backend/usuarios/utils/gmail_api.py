# utils/gmail_api.py
from base64 import urlsafe_b64encode
from concurrent.futures import ThreadPoolExecutor
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from django.conf import settings
from django.utils.html import strip_tags
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

_SCOPES = ["https://www.googleapis.com/auth/gmail.send"]
_executor = ThreadPoolExecutor(max_workers=4)

def _service():
    creds = Credentials(
        None,
        refresh_token=settings.GMAIL_REFRESH_TOKEN,
        client_id=settings.GMAIL_CLIENT_ID,
        client_secret=settings.GMAIL_CLIENT_SECRET,
        token_uri="https://oauth2.googleapis.com/token",
        scopes=_SCOPES,
    )
    return build("gmail", "v1", credentials=creds, cache_discovery=False)

def send_html(to, subject, html, cc=None, reply_to=None, from_addr=None):
    to = [e for e in (to if isinstance(to, (list, tuple)) else [to]) if e]
    cc = [e for e in (cc or []) if e]
    if not to: 
        return

    msg = MIMEMultipart("alternative")
    msg["From"] = from_addr or settings.GMAIL_FROM           # ej: "Día Administrativo <dias_administrativos@cslb.cl>"
    msg["To"] = ", ".join(to)
    if cc: msg["Cc"] = ", ".join(cc)
    if reply_to: msg["Reply-To"] = reply_to
    msg["Subject"] = subject
    msg.attach(MIMEText(strip_tags(html), "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    raw = urlsafe_b64encode(msg.as_bytes()).decode()
    svc = _service()
    return svc.users().messages().send(userId="me", body={"raw": raw}).execute()

def send_html_async(*args, **kwargs):
    _executor.submit(send_html, *args, **kwargs)
