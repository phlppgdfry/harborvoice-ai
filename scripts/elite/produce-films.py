"""Reproducible local edit of real app takes and recorded ElevenCreative outputs.
Requires ffmpeg/ffprobe + Pillow. It does not call a paid service.
"""
from pathlib import Path
import json, subprocess, textwrap, shutil, re
from PIL import Image,ImageDraw,ImageFont
ROOT=Path.cwd(); TMP=ROOT/'var/elite/edit';TMP.mkdir(parents=True,exist_ok=True)
FONT=ROOT/'assets/fonts/Inter-SemiBold.ttf'
if not FONT.exists(): raise RuntimeError('Set the documented Inter font path before rendering.')
VO=json.loads((ROOT/'public/elite/audio.json').read_text())['clips'];takes=[max((ROOT/'var/elite/takes').glob('*.webm'),key=lambda p:p.stat().st_mtime)]

def run(args): subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error',*map(str,args)],check=True)
def title(name,lines,size=(1280,720)):
 im=Image.new('RGB',size,'#17394a');d=ImageDraw.Draw(im);w,h=size
 d.rectangle((0,0,12,h),fill='#a5d7cf')
 for i,line in enumerate(lines):
  font=ImageFont.truetype(str(FONT),54 if i==0 else 25);d.text((90,230+i*92),line,font=font,fill='#ffffff' if i==0 else '#a5d7cf')
 im.save(TMP/(name+'.png'));return TMP/(name+'.png')
end=title('ending',['HarborVoice AI','Voice. Evidence. Human control.','harborvoice-ai.vercel.app'])

def segment(source,start,duration,mode='cinema',*,index):
 out=TMP/f'{index}.mp4'
 vf='scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720' if mode=='cinema' else 'scale=1160:652:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0x17394a'
 args=['-ss',start,'-i',source] if source.suffix!='.png' else ['-loop','1','-i',source]
 run([*args,'-t',duration,'-vf',vf+',fps=25,setsar=1','-an','-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p',out]);return out

def ass(cues,path,offset=0,vertical=False):
 W,H=(720,1280) if vertical else (1280,720);fs=30 if vertical else 30;mv=255 if vertical else 42
 header=f'''[Script Info]\nScriptType: v4.00+\nPlayResX: {W}\nPlayResY: {H}\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Inter,{fs},&H00FFFFFF,&H000000FF,&H002A1D16,&H802A1D16,0,0,0,0,100,100,0,0,3,1.4,0,2,50,50,{mv},1\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n'''
 def ts(t):return f'{int(t)//3600}:{int(t)//60%60:02}:{int(t)%60:02}.{int(t*100)%100:02}'
 events=[]
 for c in cues:
  text=c['text'].replace('{','').replace('}','');text='\\N'.join(textwrap.wrap(text,34 if vertical else 65))
  events.append(f"Dialogue: 0,{ts(c['start']+offset)},{ts(c['end']+offset)},Default,,0,0,0,,{text}")
 path.write_text(header+'\n'.join(events)+'\n')

def cues(clip):
 words=json.loads((ROOT/('public/'+clip['file'].replace('.mp3','-alignment.json'))).read_text())['words'];return [{'start':w[0]['start'],'end':w[-1]['end'],'text':' '.join(x['text'] for x in w)} for i in range(0,len(words),6) if (w:=words[i:i+6])]

def render(name,clip,parts,duration,offset=2,portrait=False):
 clips=[segment(*p,index=f'{name}-{i}') for i,p in enumerate(parts)]
 listing=TMP/(name+'-concat.txt');listing.write_text('\n'.join(f"file '{p}'" for p in clips))
 visual=TMP/(name+'-visual.mp4');run(['-f','concat','-safe','0','-i',listing,'-c','copy',visual])
 subs=TMP/(name+'.ass');ass(cues(clip),subs,offset)
 final=ROOT/'public/elite'/f'{name}.mp4'
 # Raster overlays in Pillow keep this edit portable to ffmpeg builds without libass/drawtext.
 decoder=subprocess.Popen(['ffmpeg','-v','error','-i',str(visual),'-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
 encoder=subprocess.Popen(['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s','1280x720','-r','25','-i','-','-i',str(ROOT/'public'/clip['file']),'-i',str(ROOT/'public/elite/original-score.mp3'),'-filter_complex',f"[1:a]adelay={int(offset*1000)}:all=1,apad[vo];[2:a]atrim=0:{duration},afade=t=in:d=1,afade=t=out:st={duration-3}:d=3,volume=0.09[bed];[vo][bed]amix=inputs=2:duration=longest:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9[a]",'-map','0:v','-map','[a]','-t',str(duration),'-c:v','libx264','-preset','fast','-b:v','570k','-maxrate','850k','-bufsize','1700k','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart',str(final)],stdin=subprocess.PIPE)
 caption_cues=cues(clip);small=ImageFont.truetype(str(FONT),17);caption_font=ImageFont.truetype(str(FONT),30);hook_font=ImageFont.truetype(str(FONT),48)
 index=0
 while True:
  data=decoder.stdout.read(1280*720*3)
  if not data:break
  if len(data)!=1280*720*3:raise RuntimeError('Incomplete video frame')
  frame=Image.frombytes('RGB',(1280,720),data);draw=ImageDraw.Draw(frame);t=index/25
  draw.rounded_rectangle((27,17,408,55),radius=5,fill='#17394a');draw.text((38,25),'Fictional scenario / recorded demo',font=small,fill='white')
  if t<6:
   draw.text((58,130),'An answer is waiting.',font=hook_font,fill='white',stroke_width=1,stroke_fill='#17394a')
  for cue in caption_cues:
   if cue['start']+offset<=t<cue['end']+offset:
    lines=textwrap.wrap(cue['text'],65);y=655-len(lines)*39
    for line in lines:
     box=draw.textbbox((0,0),line,font=caption_font);w=box[2]-box[0];x=(1280-w)//2
     draw.rounded_rectangle((x-14,y-5,x+w+14,y+38),radius=5,fill='#17394a');draw.text((x,y),line,font=caption_font,fill='white');y+=40
  encoder.stdin.write(frame.tobytes());index+=1
 encoder.stdin.close();decoder.stdout.close()
 if decoder.wait()!=0 or encoder.wait()!=0:raise RuntimeError('Film encode failed')
 # Standalone accessibility captions use the same forced-alignment cues and exact VO offset.
 def stamp(t):return f'{int(t)//3600:02}:{int(t)//60%60:02}:{int(t)%60:02}.{int(t*1000)%1000:03}'
 (ROOT/'public/elite'/f'{name}.vtt').write_text('WEBVTT\n\n'+'\n\n'.join(f"{stamp(c['start']+offset)} --> {stamp(c['end']+offset)}\n{c['text']}" for c in cues(clip))+'\n')
 if portrait:
  # Preserve the complete product frame in portrait; never crop controls to manufacture a phone interface.
  run(['-i',final,'-vf','scale=720:405,pad=720:1280:0:360:color=0x17394a','-c:v','libx264','-preset','fast','-b:v','450k','-c:a','copy','-movflags','+faststart',ROOT/'public/elite'/f'{name}-portrait.mp4'])
 return final
C=lambda n:ROOT/f'public/elite/cinematic-{n}.mp4'
for lang in ['en','nl','fr']:
 clip=next(c for c in VO if c['file']==f'elite/commercial-{lang}.mp3')
 duration=max(36,clip['durationSeconds']+7)
 parts=[(C(1),0,7,'cinema'),(takes[0],3,9,'ui'),(C(2),0,6,'cinema'),(takes[0],12,6,'ui'),(C(3),0,4,'cinema'),(end,0,duration-32,'cinema')]
 render('commercial-'+lang,clip,parts,duration,2,portrait=lang=='en')
clip=next(c for c in VO if c['file']=='elite/explainer-en.mp3');duration=max(65,clip['durationSeconds']+6)
parts=[(C(1),0,6,'cinema'),(takes[0],0,20,'ui'),(C(2),0,6,'cinema'),(takes[0],9,12,'ui'),(C(3),0,6,'cinema'),(takes[0],16,10,'ui'),(end,0,duration-60,'cinema')]
render('enterprise-explainer',clip,parts,duration,1)
print('Rendered English/Dutch/French commercials, portrait cut and enterprise explainer. Local composition; source recordings are genuine ElevenLabs outputs.')
