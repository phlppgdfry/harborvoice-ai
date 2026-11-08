"""Two-pass measured loudness mastering. Local only; no provider calls."""
from pathlib import Path
import json,re,subprocess
films=[p for p in Path('public/elite').glob('*.mp4') if not p.name.startswith('cinematic') and 'portrait' not in p.name]
compress='acompressor=threshold=0.13:ratio=2.5:attack=10:release=150'
for film in films:
 first=subprocess.run(['ffmpeg','-hide_banner','-i',str(film),'-af',compress+',loudnorm=I=-14:TP=-3:LRA=9:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
 m=json.loads(re.search(r'\{\s*"input_i".*?\}',first.stderr,re.S).group())
 af=compress+f",loudnorm=I=-14:TP=-3:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=48000"
 temp=Path('var/elite')/(film.stem+'-mastered.mp4')
 subprocess.run(['ffmpeg','-y','-v','error','-i',str(film),'-c:v','copy','-af',af,'-c:a','aac','-b:a','128k','-movflags','+faststart',str(temp)],check=True);temp.replace(film)
portrait=Path('public/elite/commercial-en-portrait.mp4');temp=Path('var/elite/portrait-mastered.mp4')
subprocess.run(['ffmpeg','-y','-v','error','-i',str(portrait),'-i','public/elite/commercial-en.mp4','-map','0:v','-map','1:a','-c','copy','-movflags','+faststart',str(temp)],check=True);temp.replace(portrait)
print('Mastered four films with measured two-pass normalization; portrait shares the English master.')
# Final measured gain trim with oversampled true-peak limiting. AAC encoding can
# overshoot a nominal ceiling, so retain a conservative3dB margin before encode.
for film in [*films,portrait]:
 result=subprocess.run(['ffmpeg','-hide_banner','-i',str(film),'-af','loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
 measured=json.loads(re.search(r'\{\s*"input_i".*?\}',result.stderr,re.S).group());gain=-14-float(measured['input_i']);temp=Path('var/elite')/(film.stem+'-trim.mp4')
 subprocess.run(['ffmpeg','-y','-v','error','-i',str(film),'-c:v','copy','-af',f'volume={gain}dB,aresample=192000,alimiter=limit=0.7:level=false:attack=2:release=100,aresample=48000','-c:a','aac','-b:a','128k','-movflags','+faststart',str(temp)],check=True);temp.replace(film)
