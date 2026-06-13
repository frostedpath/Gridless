import math
import wave
import struct
import os

os.makedirs('assets', exist_ok=True)

SAMPLE_RATE = 44100
DURATION = 3.0

wave_file = wave.open('assets/siren.wav', 'w')
wave_file.setnchannels(1)
wave_file.setsampwidth(2)
wave_file.setframerate(SAMPLE_RATE)

num_samples = int(SAMPLE_RATE * DURATION)
for i in range(num_samples):
    t = float(i) / SAMPLE_RATE
    phase = 850 * t - (350 / (2 * math.pi * 1.5)) * math.cos(2 * math.pi * 1.5 * t)
    value = math.sin(2 * math.pi * phase)
    
    # Add envelope
    env = 1.0
    if t < 0.1: env = t / 0.1
    if t > DURATION - 0.1: env = (DURATION - t) / 0.1
    
    # Square wave it for harsher sound
    value = 1.0 if value > 0 else -1.0
    
    sample = int(value * env * 16000.0)
    wave_file.writeframesraw(struct.pack('<h', sample))

wave_file.close()
