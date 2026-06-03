import sys
import numpy as np

# trik sakti: kita suntik paksa atribut 'object' ke numpy sebelum tfjs dimuat
if not hasattr(np, 'object'):
    np.object = object

try:
    import tensorflowjs as tfjs
    import tensorflow as tf
    print("📦 Pustaka berhasil dimuat dengan aman!")
except ImportError:
    print("❌ Eror: Pastikan kamu sudah install tensorflow dan tensorflowjs di laptop.")
    sys.exit(1)

# Jalur file .keras kamu (Silakan sesuaikan jika letaknya bukan di Downloads)
keras_model_path = "C:/Users/abdan/Downloads/best_model_daun_jagung.keras"

# Jalur folder tujuan di proyek Next.js kamu
output_folder = "./public/local_model"

print("⏳ Sedang mengonversi model... Harap tunggu sejenak.")

try:
    # Memuat model .keras asli kamu
    model = tf.keras.models.load_model(keras_model_path)
    
    # Konversi langsung ke format Layers Model TensorFlow.js
    tfjs.converters.save_keras_model(model, output_folder)
    
    print("\n🔥 BOOM! KONVERSI BERHASIL 100%!")
    print(f"Silakan cek folder: {output_folder} di VS Code kamu.")
except Exception as e:
    print(f"\nGagal mengonversi karena: {e}")