"""Original geometric review artwork; no third-party art or generated endorsements."""
from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import math
font='assets/fonts/Inter-SemiBold.ttf'
def build(file,title,subtitle,palette,size):
 im=Image.new('RGB',size,palette[0]);d=ImageDraw.Draw(im);w,h=size
 for j in range(30):
  pts=[]
  for x in range(-50,w+50,8):
   y=h*.38+j*11+math.sin(x/w*math.pi*3+j*.12)*(h*.12)
   pts.append((x,y))
  d.line(pts,fill=palette[1] if j%4 else palette[2],width=2)
 f=ImageFont.truetype(font,int(w*.052));small=ImageFont.truetype(font,int(w*.019));label=ImageFont.truetype(font,int(w*.018))
 d.text((w*.08,h*.075),'HARBORVOICE  /  INDEPENDENT EDITION',font=label,fill=palette[1])
 y=h*.64
 for line in title.split('|'):d.text((w*.08,y),line,font=f,fill='#f5f7fb');y+=w*.07
 for line in subtitle.split('|'):d.text((w*.08,y+w*.025),line,font=small,fill='#b7c7d8');y+=w*.035
 im.save(file)
Path('public/recognition').mkdir(exist_ok=True)
build('public/recognition/book-cover.png','Building Reliable|Enterprise Voice|AI Agents','Engineering decisions, tests and limits|A HarborVoice case study · review edition',('#0b1727','#36c6b6','#e9ab65'),(1600,2400))
for f,t,c in [('future-systems','Future Systems',('#101c2e','#49d5d0','#f6bc72')),('northern-lights','Northern Lights',('#112325','#93dcc0','#b9a8ef')),('human-intelligence','Human Intelligence',('#291c25','#f1bc93','#7bd0c6'))]:build('public/recognition/'+f+'.png',t.replace(' ','|',1),'Cinematic Technology Soundtracks|Original instrumental · marketplace review draft',c,(1600,1600))
print('Four original artwork files created')
