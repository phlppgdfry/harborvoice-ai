"""Build a text-only EPUB 3 review package using the Python standard library."""
from pathlib import Path
from zipfile import ZipFile, ZIP_STORED, ZIP_DEFLATED
from html import escape
import re,json,hashlib,xml.etree.ElementTree as ET
source=Path('docs/recognition/book/manuscript.md').read_text()
words=len(source.split('## References')[0].split())
assert words>=6000
parts=re.split(r'^## ',source,flags=re.M)
chapters=[]
for i,part in enumerate(parts):
 lines=part.strip().splitlines();title=lines[0].lstrip('# ').strip();body='\n'.join(lines[1:]);paragraphs=[]
 for p in re.split(r'\n\s*\n',body):
  if p.strip():paragraphs.append('<p>'+re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',escape(p.strip()).replace('\n',' '))+'</p>')
 chapters.append((f'chapter-{i}.xhtml',title,'<h1>'+escape(title)+'</h1>'+''.join(paragraphs)))
head='<?xml version="1.0" encoding="utf-8"?>'
def xhtml(title,body):return head+'<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en"><head><title>'+escape(title)+'</title><link rel="stylesheet" type="text/css" href="style.css"/></head><body>'+body+'</body></html>'
nav=xhtml('Contents','<nav epub:type="toc" id="toc"><h1>Contents</h1><ol>'+''.join('<li><a href="'+f+'">'+escape(t)+'</a></li>' for f,t,b in chapters)+'</ol></nav>')
manifest='<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="style" href="style.css" media-type="text/css"/>'+''.join(f'<item id="c{i}" href="{f}" media-type="application/xhtml+xml"/>' for i,(f,t,b) in enumerate(chapters))
spine=''.join(f'<itemref idref="c{i}"/>' for i in range(len(chapters)))
identifier='urn:sha256:'+hashlib.sha256(source.encode()).hexdigest()
package=head+'<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="book-id">'+identifier+'</dc:identifier><dc:title>Building Reliable Enterprise Voice AI Agents</dc:title><dc:language>en</dc:language><dc:creator>HarborVoice Project — review draft</dc:creator><dc:description>An original practical engineering book on grounded, multilingual voice agents, human review, testing, budgets and deployment.</dc:description><meta property="dcterms:modified">2026-11-08T00:00:00Z</meta></metadata><manifest>'+manifest+'</manifest><spine>'+spine+'</spine></package>'
container=head+'<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
output=Path('public/recognition/reliable-enterprise-voice-ai.epub')
with ZipFile(output,'w') as z:
 z.writestr('mimetype','application/epub+zip',compress_type=ZIP_STORED)
 for f,b in [('META-INF/container.xml',container),('EPUB/package.opf',package),('EPUB/nav.xhtml',nav)]:z.writestr(f,b,compress_type=ZIP_DEFLATED)
 z.writestr('EPUB/style.css','body{font-family:serif;line-height:1.55;margin:5%;} h1{font-family:sans-serif;line-height:1.2;} p{margin:0 0 1em;}',compress_type=ZIP_DEFLATED)
 for f,t,b in chapters:z.writestr('EPUB/'+f,xhtml(t,b),compress_type=ZIP_DEFLATED)
with ZipFile(output) as z:
 assert z.namelist()[0]=='mimetype' and z.getinfo('mimetype').compress_type==ZIP_STORED
 assert z.testzip() is None
 for f in z.namelist():
  if f.endswith(('.xml','.opf','.xhtml')):ET.fromstring(z.read(f))
 assert all('EPUB/'+f in z.namelist() for f,t,b in chapters)
report={'file':str(output),'wordsBeforeReferences':words,'chaptersAndFrontmatter':len(chapters),'checks':['EPUB mimetype first and uncompressed','ZIP CRC integrity','All XML/XHTML well formed','Manifest and spine include every chapter','Text-only book; cover delivered separately'],'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'scope':'Structural local validation, not an EPUBCheck or ElevenReader acceptance result. External publication pending owner approval.'}
Path('docs/recognition/book/package-verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
