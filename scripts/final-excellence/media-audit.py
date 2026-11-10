"""Local metadata and full-decode audit; no provider operations or image edits."""
from pathlib import Path
import datetime
import json
import subprocess

assets = json.loads(Path("config/assets.json").read_text())["files"]
results = []
for asset in assets:
    path = Path(asset["path"])
    if path.suffix not in {".mp3", ".mp4", ".m4b"}:
        continue
    probe = subprocess.run(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", str(path)], capture_output=True, timeout=30)
    decode = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "null", "-"], capture_output=True, timeout=120)
    data = json.loads(probe.stdout) if probe.returncode == 0 else {}
    results.append({"path": str(path), "sha256": asset["sha256"], "probeExit": probe.returncode, "decodeExit": decode.returncode, "duration": data.get("format", {}).get("duration"), "streams": [{k: s[k] for k in ["codec_type", "codec_name", "width", "height", "sample_rate", "channels"] if k in s} for s in data.get("streams", [])], "decodeError": decode.stderr.decode()[:200]})
report = {"checkedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "scope": "Existing registered local audio/video: technical probe and complete decode. Not human listening, native timeline acceptance, loudness compliance or speaker-quality assessment.", "results": results, "passed": all(r["decodeExit"] == r["probeExit"] == 0 for r in results)}
Path("docs/final-excellence/media-audit.json").write_text(json.dumps(report, indent=2) + "\n")
print(f"{len(results)} audio/video files; all decode: {report['passed']}")
raise SystemExit(0 if report["passed"] else 1)
