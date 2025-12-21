import React, { ChangeEvent } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot } from "firebase/storage";
import { storage } from "../../firebase"; // Đường dẫn tới file config bên trên

export default function MessageInput() {

    // Hàm xử lý khi chọn file
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; // Dấu ? để tránh lỗi nếu files null
        if (!file) return;

        // Tạo đường dẫn file duy nhất
        const storageRef = ref(storage, `images/${Date.now()}-${file.name}`);

        // Bắt đầu upload
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot: UploadTaskSnapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Đang tải: ${progress}%`);
            },
            (error: Error) => {
                console.error("Lỗi upload:", error.message);
            },
            async () => {
                // Lấy URL sau khi hoàn tất
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log("Link ảnh:", downloadURL);

            }
        );
    };

    return (
        <div className="input-container">
            <input
                type="file"
                id="img-upload"
                accept="image/*"
                hidden
                onChange={handleImageChange}
            />
            <label htmlFor="img-upload" style={{ cursor: 'pointer' }}>
                📷 Gửi ảnh
            </label>
        </div>
    );
}