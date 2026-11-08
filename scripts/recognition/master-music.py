"""Local measured normalization and complete audio integrity checks; no API calls."""
from pathlib import Path
import subprocess,json,re,hashlib,shutil
p=Path('docs/recognition/music-collection.json');report=json.loads(p.read_text());results=[]
for t in report['tracks']:
 f=Path('public')/t['file'];raw=Path('var/recognition')/(t['id']+'-original.mp3')
 if not raw.exists():shutil.copyfile(f,raw)
 def measure(file):
  r=subprocess.run(['ffmpeg','-hide_banner','-i',str(file),'-af','loudnorm=I=-14.5:TP=-2:LRA=9:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
  return json.loads(re.search(r'\{\s*"input_i".*?\}',r.stderr,re.S).group())
 m=measure(raw);gain=-14.5-float(m['input_i']);temp=Path('var/recognition')/(t['id']+'-master.mp3')
 subprocess.run(['ffmpeg','-y','-v','error','-i',str(raw),'-af',f'volume={gain}dB,aresample=192000,alimiter=limit=0.7:level=false:attack=2:release=100,aresample=48000','-c:a','libmp3lame','-b:a','192k',str(temp)],check=True);temp.replace(f)
 final=measure(f);assert float(final['input_tp'])<=-1.5
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(f)]))
 assert 55<float(probe['format']['duration'])<65
 t.setdefault('originalGenerationSha256',hashlib.sha256(raw.read_bytes()).hexdigest());t['sha256']=hashlib.sha256(f.read_bytes()).hexdigest();t['status']='TESTED — READY FOR HUMAN LISTENING REVIEW'
 results.append({'id':t['id'],'durationSeconds':float(probe['format']['duration']),'integratedLufs':float(final['input_i']),'truePeakDbtp':float(final['input_tp']),'sha256':t['sha256'],'checks':['Full decode','Duration','Measured loudness and true peak','Original preserved privately'],'limitations':'Automated technical checks do not establish subjective composition quality, transition quality, rights clearance or native-speaker review.'})
p.write_text(json.dumps(report,indent=2)+'\n');Path('docs/recognition/music-quality.json').write_text(json.dumps({'method':'Measured gain to−14.5 LUFS with oversampled conservative peak limiting, then full decode after MP3 encode. No extra provider generation.', 'tracks':results},indent=2)+'\n');print(json.dumps(results,indent=2))
