# Kỳ Phổ

App xem kỳ phổ cờ tướng (quân chữ Hán), xem từng nước và các biến. Hiện có trọn cuốn *Bình Phong Mã hiện đại* (Cục 1–57).

Mở trên iPhone bằng Safari: https://trinhtung-tech.github.io/ky-pho/ → nút Chia sẻ → **Thêm vào MH chính**. App chạy cả khi không có mạng.

- `data/*.txt`: nước đi từng chương (ký hiệu Việt: P2-5, M8.7, X2/1…)
- `src/`: giao diện và bộ luật cờ
- `node tools/check.js data/<file>`: kiểm tra luật từng nước
- `node tools/build.js`: dựng lại `index.html` ở thư mục gốc
