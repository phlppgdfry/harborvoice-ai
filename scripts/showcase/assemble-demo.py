#!/usr/bin/env python3
"""Assemble the HarborVoice demo video from recorded shots and narration segments.

Usage:
  python3 scripts/showcase/assemble-demo.py <rec-dir> <narration-dir> <script.json> <out-dir>

<rec-dir>        s1-intro.webm ... s9-close.webm from record-media.mjs
<narration-dir>  seg1.mp3 ... seg9.mp3 (ElevenLabs TTS, one per script entry)
<script.json>    the nine narration texts, used for the captions
Music: the three original instrumentals in public/recognition, ducked under the voice.
Requires ffmpeg with libx264, Node and Playwright (title cards are rendered by render-cards.mjs).
"""
import json
import re
import subprocess
import sys
from pathlib import Path

rec, narr, script_file, out = (Path(a) for a in sys.argv[1:5])
out.mkdir(parents=True, exist_ok=True)
work = out / "work"
work.mkdir(exist_ok=True)
subprocess.run(["node", "scripts/showcase/render-cards.mjs", str(work)], check=True)
script = json.loads(script_file.read_text())
shots = ["s1-intro", "s2-architecture", "s3-rules", "s4-review", "s5-agentproof",
         "s6-agentops", "s7-limits", "s8-creative", "s9-close"]
assert len(script) == len(shots) == 9
LEAD, TAIL = 0.5, 1.3  # silence before and after each narration segment
INTRO, OUTRO = 5.0, 7.0
NAVY = "0x0b1f2a"


def run(args):
    subprocess.run(args, check=True)


def duration(path):
    return float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)]))


def card(path, seconds, png):
    vf = f"fps=30,format=yuv420p,fade=t=in:st=0:d=0.6,fade=t=out:st={seconds - 0.6}:d=0.6"
    run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-t", str(seconds), "-i", str(png), "-vf", vf,
         "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", str(path)])


narration = [narr / f"seg{i}.mp3" for i in range(1, 10)]
lengths = [duration(p) for p in narration]
spans = [LEAD + n + TAIL for n in lengths]

# 1. Video segments, 1920x1080, each exactly as long as its narration slot.
parts = []
card(work / "intro.mp4", INTRO, work / "intro.png")
parts.append(work / "intro.mp4")
for shot, span in zip(shots, spans):
    target = work / f"{shot}.mp4"
    vf = (f"setpts=PTS-STARTPTS,scale=1920:1200:flags=lanczos,crop=1920:1080:0:0,fps=30,"
          f"tpad=stop_mode=clone:stop_duration={span},trim=duration={span},setpts=PTS-STARTPTS,"
          f"fade=t=in:st=0:d=0.35,fade=t=out:st={span - 0.35}:d=0.35")
    run(["ffmpeg", "-v", "error", "-y", "-ss", "0.6", "-i", str(rec / f"{shot}.webm"), "-an", "-vf", vf,
         "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", str(target)])
    parts.append(target)
card(work / "outro.mp4", OUTRO, work / "outro.png")
parts.append(work / "outro.mp4")
(work / "concat.txt").write_text("".join(f"file '{p.resolve()}'\n" for p in parts))
run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(work / "concat.txt"),
     "-c", "copy", str(work / "video.mp4")])
total = INTRO + sum(spans) + OUTRO

# 2. Narration track with each segment at its offset.
inputs, filters, labels, offset = [], [], [], INTRO + LEAD
for i, (seg, span) in enumerate(zip(narration, spans)):
    inputs += ["-i", str(seg)]
    ms = int(round(offset * 1000))
    filters.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={ms}|{ms}[n{i}]")
    labels.append(f"[n{i}]")
    offset += span
filters.append("".join(labels) + f"amix=inputs=9:normalize=0,apad,atrim=duration={total}[voice]")
run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filters), "-map", "[voice]",
     "-c:a", "pcm_s16le", str(work / "voice.wav")])

# 3. Music bed: the three originals with crossfades, ducked under the voice.
tracks = [Path("public/recognition") / f"{t}.mp3" for t in ("northern-lights", "future-systems", "human-intelligence")]
music_filter = (
    "[0:a][1:a]acrossfade=d=4[m01];[m01][2:a]acrossfade=d=4,aresample=48000,aformat=channel_layouts=stereo,"
    f"apad,atrim=duration={total},volume=-17dB,afade=t=in:st=0:d=2,afade=t=out:st={total - 4}:d=4[music];"
    "[3:a]asplit[v1][v2];[music][v1]sidechaincompress=threshold=0.015:ratio=10:attack=15:release=450[duck];"
    "[duck][v2]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[mix]"
)
run(["ffmpeg", "-v", "error", "-y", *sum((["-i", str(t)] for t in tracks), []), "-i", str(work / "voice.wav"),
     "-filter_complex", music_filter, "-map", "[mix]", "-ar", "48000", "-c:a", "pcm_s16le", str(work / "mix.wav")])

# 4. Mux.
final = out / "harborvoice-demo.mp4"
run(["ffmpeg", "-v", "error", "-y", "-i", str(work / "video.mp4"), "-i", str(work / "mix.wav"),
     "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest",
     "-movflags", "+faststart", str(final)])
run(["ffmpeg", "-v", "error", "-y", "-ss", str(INTRO + 2.5), "-i", str(final), "-frames:v", "1", "-q:v", "3",
     str(out / "harborvoice-demo.jpg")])


# 5. Captions: one cue per sentence, timed by character share within its segment.
def stamp(t):
    h, rem = divmod(t, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h):02d}:{int(m):02d}:{s:06.3f}"


cues, offset = [], INTRO + LEAD
for text, length, span in zip(script, lengths, spans):
    sentences = [s.strip() for s in re.split(r"(?<=[.?!])\s+", text) if s.strip()]
    chars = sum(len(s) for s in sentences)
    t = offset
    for s in sentences:
        d = length * len(s) / chars
        cues.append((t, t + d, s))
        t += d
    offset += span
vtt = "WEBVTT\n\n" + "\n".join(f"{i}\n{stamp(a)} --> {stamp(b)}\n{s}\n" for i, (a, b, s) in enumerate(cues, 1))
(out / "harborvoice-demo.vtt").write_text(vtt)
srt = "\n".join(f"{i}\n{stamp(a).replace('.', ',')} --> {stamp(b).replace('.', ',')}\n{s}\n" for i, (a, b, s) in enumerate(cues, 1))
(out / "harborvoice-demo.srt").write_text(srt)
(out / "harborvoice-demo-transcript.txt").write_text("\n\n".join(script) + "\n")
print(json.dumps({"seconds": round(total, 2), "segments": [round(x, 2) for x in spans], "cues": len(cues)}))
