import base64, json
b = json.load(open('beats.json'))
enc = lambda f: base64.b64encode(open(f, 'rb').read()).decode()
s = open('template.html').read()
s = (s.replace('__INTERTIGHT__', enc('intertight.woff2')).replace('__INTER__', enc('inter.woff2'))
      .replace('__MARK__', enc('mark.png')).replace('__BPM__', repr(b['bpm'])).replace('__OFF__', repr(float(b['first_downbeat']))))
open('index.html', 'w').write(s); print('index.html', len(s) // 1024, 'KB')
