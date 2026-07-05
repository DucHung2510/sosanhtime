# YouTube - TikTok Compare

Nhỏ gọn: một app Node.js (Express) lấy thumbnail và thời gian đăng từ YouTube và TikTok, so sánh chênh lệch phút.

Chạy nhanh:

```bash
npm install
npm start
# Mở http://localhost:3000
```

Files:
- [public/index.html](public/index.html)
- [server.js](server.js)

Ghi chú: scraping dựa trên HTML và oEmbed; một vài video có thể không trả về thời gian chính xác do thay đổi cấu trúc trang.

Deploy lên Vercel

1. Tạo repository Git và đẩy code lên GitHub/GitLab/Bitbucket.
2. Đăng nhập vào Vercel và import project (chọn repository). Vercel sẽ cài dependencies tự động.
3. Hoặc cài `vercel` CLI và deploy thủ công:

```bash
npm install -g vercel
vercel login
vercel --prod
```

Notes:
- Các endpoint serverless mới: `/api/youtube?url=...` và `/api/tiktok?url=...`.
- Nếu muốn test locally, cài `vercel` và chạy `vercel dev`.

Đẩy lên GitHub và kết nối Vercel

1. Nếu chưa có, tạo repository trên GitHub và sao chép URL (ví dụ `git@github.com:you/your-repo.git` hoặc `https://github.com/you/your-repo.git`).
2. Tại thư mục dự án, chạy:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

3. Trên Vercel: click "Import Project" → chọn Git provider → chọn repository → Deploy.

4. Hoặc dùng `vercel` CLI để deploy:

```bash
npm install -g vercel
vercel login
vercel
# hoặc để deploy production
vercel --prod
```

5. Nếu deploy qua Git, Vercel sẽ tự động chạy và publish khi bạn push.

Lưu ý: Vercel sẽ phục vụ static files từ `/public` theo cấu hình `vercel.json`, và các API sẽ hoạt động tại `/api/*`.

Trang đơn giản để so sánh

Phiên bản hiện tại là một trang tĩnh trong `public/`:
- [public/index.html](public/index.html)
- [public/script.js](public/script.js)

Hướng dẫn sử dụng:
1. Mở trang (local: `npm start` → http://localhost:3000 or deploy trên Vercel).
2. Dán link YouTube / TikTok vào từng panel và bấm `Lấy thumbnail & tiêu đề` để tự động fetch tiêu đề và thumbnail via oEmbed (lưu ý: oEmbed có thể bị chặn bởi CORS khi fetch trực tiếp từ trình duyệt).
3. Nếu oEmbed không trả về ngày/giờ, nhập ngày và giờ theo tay rồi trang sẽ hiển thị chênh lệch (phút).

Ghi chú kỹ thuật:
- Lấy ngày/giờ chính xác từ YouTube/TikTok thường yêu cầu gọi server-side (scrape hoặc dùng API key). Để giữ dự án đơn giản, trang hiện cho phép nhập thủ công ngày/giờ và dùng oEmbed chỉ để lấy thumbnail/title.



