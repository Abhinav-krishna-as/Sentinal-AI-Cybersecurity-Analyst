"""Sentinal AI CYBI incident worker. Separate from Hanu AI; report/notify only."""
import base64, json, logging, os, time
from datetime import datetime, timezone
from pathlib import Path
import requests
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle

BASE=os.getenv('SENTINAL_BASE_URL','http://127.0.0.1:8001').rstrip('/')
POLL=max(5,int(os.getenv('CYBI_POLL_SECONDS','10')))
THRESHOLD=max(0,min(100,int(os.getenv('CYBI_ALERT_THRESHOLD','80'))))
RESEND_API_KEY=os.getenv('RESEND_API_KEY','').strip()
RESEND_FROM_EMAIL=os.getenv('RESEND_FROM_EMAIL','Sentinal AI <onboarding@resend.dev>').strip()
ROOT=Path(__file__).resolve().parent; OUT=Path(os.getenv('CYBI_REPORT_DIR',str(ROOT/'reports'/'cybi_incidents')))
STATE=Path(os.getenv('CYBI_STATE_FILE',str(ROOT/'reports'/'cybi_automation_state.json')))
logging.basicConfig(level=logging.INFO,format='%(asctime)s | CYBI | %(levelname)s | %(message)s'); log=logging.getLogger('cybi')
http=requests.Session()

def val(obj,*keys,default=None):
    for k in keys:
        if obj.get(k) is not None and obj.get(k)!='': return obj[k]
    return default

def txt(x,default='Not available'):
    return default if x is None or str(x).strip()=='' else str(x).strip()

def normalise(r):
    try: risk=int(float(val(r,'risk_score','risk','score',default=0)))
    except (TypeError,ValueError): risk=0
    ev=val(r,'evidence','signals','indicators',default=[])
    if isinstance(ev,str): ev=[ev]
    if not isinstance(ev,list): ev=[str(ev)]
    return {'id':txt(val(r,'incident_id','id','uuid'),'INCIDENT-UNKNOWN'),
      'threat':txt(val(r,'threat','threat_type','title','name')),
      'application':txt(val(r,'application','application_name','app','source'),'Sentinal AI'),
      'source_ip':txt(val(r,'source_ip','src_ip','source')),'username':txt(val(r,'username','user','account')),
      'target':txt(val(r,'target','path','endpoint')),'risk_score':max(0,min(100,risk)),
      'risk_level':txt(val(r,'risk_level','severity','level'),'UNKNOWN').upper(),
      'evidence':[txt(x) for x in ev],'attempt_count':val(r,'attempt_count','events','event_count',default=0),
      'confidence':val(r,'confidence','detection_confidence'),'status':txt(val(r,'status','state'),'DETECTED'),
      'detected_at':txt(val(r,'detected_at','created_at','timestamp','time'),datetime.now(timezone.utc).isoformat())}

def load_state():
    try:
        d=json.loads(STATE.read_text(encoding='utf-8')); return d if isinstance(d,dict) else {'processed':{}}
    except (OSError,json.JSONDecodeError): return {'processed':{}}

def save_state(s):
    STATE.parent.mkdir(parents=True,exist_ok=True); tmp=STATE.with_suffix('.tmp')
    tmp.write_text(json.dumps(s,indent=2),encoding='utf-8'); tmp.replace(STATE)

def incidents():
    r=http.get(BASE+'/api/incidents',timeout=20); r.raise_for_status(); d=r.json()
    arr=d if isinstance(d,list) else d.get('incidents',[]) if isinstance(d,dict) else []
    return [x for x in arr if isinstance(x,dict)]

def automation_settings():
    """Read the same settings saved by the dashboard UI; fall back to environment defaults."""
    defaults = {
        'enabled': False,
        'investigate': False,
        'notify': False,
        'report': False,
        'email': '',
        'threshold': THRESHOLD,
    }
    try:
        response = http.get(BASE + '/api/cybi/automation-settings', timeout=8)
        response.raise_for_status()
        payload = response.json()
        settings = payload.get('settings', {}) if isinstance(payload, dict) else {}
        if isinstance(settings, dict):
            defaults.update(settings)
    except (requests.RequestException, ValueError, AttributeError) as error:
        log.debug('Using environment automation settings; backend settings unavailable: %s', error)
    defaults['enabled'] = bool(defaults.get('enabled', True))
    defaults['investigate'] = bool(defaults.get('investigate', True))
    defaults['notify'] = bool(defaults.get('notify', True))
    defaults['report'] = bool(defaults.get('report', True))
    try:
        defaults['threshold'] = max(50, min(95, int(float(defaults.get('threshold', THRESHOLD)))))
    except (TypeError, ValueError):
        defaults['threshold'] = THRESHOLD
    return defaults


def cybi(inc):
    q=('Provide an evidence-led incident analysis with Executive Summary, Evidence, Risk Assessment, '
       'Recommended Next Steps, and Limitations. Separate facts from inference. Do not claim actions were executed.')
    r=http.post(BASE+'/api/cybi/analyze',json={'incident':inc,'question':q},timeout=60); r.raise_for_status(); d=r.json()
    if d.get('status')!='success' or not d.get('analysis'): raise RuntimeError(d.get('detail') or d.get('error') or 'CYBI returned no analysis')
    return str(d['analysis']),txt(d.get('provider') or d.get('analyst'),'Cybi')

def make_pdf(i,analysis,provider):
    OUT.mkdir(parents=True,exist_ok=True); safe=''.join(c if c.isalnum() or c in '-_' else '_' for c in i['id']); path=OUT/(safe+'-cybi-report.pdf')
    st=getSampleStyleSheet(); st.add(ParagraphStyle(name='CYTitle',parent=st['Title'],textColor=colors.HexColor('#0f766e')))
    st.add(ParagraphStyle(name='CYHead',parent=st['Heading2'],textColor=colors.HexColor('#0f766e'),spaceBefore=10))
    st.add(ParagraphStyle(name='CYBody',parent=st['BodyText'],fontSize=9,leading=13,spaceAfter=5))
    esc=lambda x:txt(x).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
    story=[Paragraph('SENTINAL AI — CYBI SECURITY REPORT',st['CYTitle']),Paragraph('Generated UTC: '+datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S'),st['CYBody'])]
    rows=[['Incident',esc(i['id']),'Risk',f"{i['risk_score']}/100"],['Threat',esc(i['threat']),'Severity',esc(i['risk_level'])],['Application',esc(i['application']),'Status',esc(i['status'])],['Source IP',esc(i['source_ip']),'Target',esc(i['target'])],['Username',esc(i['username']),'CYBI provider',esc(provider)],['Detected at',esc(i['detected_at']),'Confidence',esc(i['confidence'])]]
    t=Table(rows,colWidths=[24*mm,56*mm,28*mm,62*mm]); t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),colors.HexColor('#f1f7f4')),('GRID',(0,0),(-1,-1),.4,colors.HexColor('#d5e2dc')),('FONTNAME',(0,0),(0,-1),'Helvetica-Bold'),('FONTNAME',(2,0),(2,-1),'Helvetica-Bold'),('FONTSIZE',(0,0),(-1,-1),8),('VALIGN',(0,0),(-1,-1),'TOP')]))
    story += [t,Paragraph('Evidence',st['CYHead'])]
    story += [Paragraph('• '+esc(x),st['CYBody']) for x in i['evidence']] or [Paragraph('No evidence supplied by API.',st['CYBody'])]
    story += [Paragraph('CYBI Analysis',st['CYHead']),Paragraph(esc(analysis).replace('\n','<br/>'),st['CYBody']),Paragraph('Automation outcome',st['CYHead']),Paragraph('Report/notification only. No IP blocking, account disabling, or remediation was executed. Verify findings and approve disruptive responses manually.',st['CYBody'])]
    def footer(c,d):
        c.saveState(); c.setStrokeColor(colors.HexColor('#d5e2dc')); c.line(18*mm,14*mm,A4[0]-18*mm,14*mm); c.setFont('Helvetica',8); c.drawString(18*mm,9*mm,'Sentinal AI · CYBI'); c.drawRightString(A4[0]-18*mm,9*mm,f'Page {d.page}'); c.restoreState()
    SimpleDocTemplate(str(path),pagesize=A4,rightMargin=18*mm,leftMargin=18*mm,topMargin=16*mm,bottomMargin=20*mm).build(story,onFirstPage=footer,onLaterPages=footer)
    return path

def email_pdf(path,i,analysis,recipient):
    recipient = str(recipient or '').strip()
    if not recipient:
        log.warning('PDF saved; email skipped. Enter a notification email in CYBI Create Automation.')
        return False
    if not RESEND_API_KEY:
        log.warning('PDF saved; email skipped. RESEND_API_KEY is not configured in the Sentinal process environment.')
        return False
    subject=f"[Sentinal AI] {i['risk_level']} incident {i['id']} — {i['threat']}"
    text=(f"CYBI incident report\nIncident: {i['id']}\nThreat: {i['threat']}\nRisk: {i['risk_score']}/100 ({i['risk_level']})\nSource IP: {i['source_ip']}\nTarget: {i['target']}\n\nCYBI analysis:\n{analysis}\n\nPDF attached. No remediation action was executed.")
    payload={
        'from': RESEND_FROM_EMAIL,
        'to': [recipient],
        'subject': subject,
        'text': text,
        'attachments': [{'filename': path.name, 'content': base64.b64encode(path.read_bytes()).decode('ascii')}],
    }
    try:
        response=requests.post('https://api.resend.com/emails',headers={'Authorization':f'Bearer {RESEND_API_KEY}','Content-Type':'application/json'},json=payload,timeout=30)
        if not response.ok:
            raise RuntimeError(f'Resend HTTP {response.status_code}: {response.text[:500]}')
        result=response.json()
    except Exception as error:
        log.error('Resend email failed for %s: %s',i['id'],error)
        return False
    log.info('Sent CYBI PDF for %s to %s via Resend (id=%s)',i['id'],recipient,result.get('id','unknown'))
    return True

def main():
    STATE.parent.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    state = load_state()
    log.info('Polling %s every %ss; initial threshold=%s', BASE, POLL, THRESHOLD)
    while True:
        try:
            settings = automation_settings()
            if not settings['enabled']:
                log.debug('Automation disabled in dashboard settings.')
                time.sleep(POLL)
                continue
            if not (settings['investigate'] or settings['report'] or settings['notify']):
                log.debug('No CYBI automation actions are enabled.')
                time.sleep(POLL)
                continue
            for raw in incidents():
                i = normalise(raw)
                sig = f"{i['id']}:{i['risk_score']}:{i['status']}"
                if state.setdefault('processed', {}).get(i['id']) == sig or i['risk_score'] < settings['threshold']:
                    continue
                try:
                    analysis, provider = cybi(i)
                    path = None
                    if settings['report'] or settings['notify']:
                        path = make_pdf(i, analysis, provider)
                    if settings['notify'] and path is not None:
                        email_pdf(path, i, analysis, settings.get('email', ''))
                    state['processed'][i['id']] = sig
                    save_state(state)
                    if path:
                        log.info('CYBI analysis/report ready: %s', path)
                    else:
                        log.info('CYBI analysis completed for %s (PDF/email disabled).', i['id'])
                except Exception:
                    log.exception('Incident %s not completed; will retry', i['id'])
        except requests.RequestException as e:
            log.warning('Dashboard unavailable at %s: %s', BASE, e)
        except Exception:
            log.exception('Polling cycle failed')
        time.sleep(POLL)
if __name__=='__main__':
    try: main()
    except KeyboardInterrupt: log.info('Worker stopped')
