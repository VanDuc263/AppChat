export type CloudinaryUploadResponse = {
    secure_url?: string;
    url?: string;
    error?: { message?: string };
};

export const uploadImageToCloudinary = (file: File, onProgress: (p: number) => void) => {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !preset) {
        return Promise.reject(new Error("Thiếu Cloudinary config trong .env (CLOUD_NAME / UPLOAD_PRESET)."));
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", preset);

    return new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", endpoint);

        xhr.upload.onprogress = (e) => e.lengthComputable && onProgress((e.loaded / e.total) * 100);

        xhr.onload = () => {
            try {
                const res: CloudinaryUploadResponse = JSON.parse(xhr.responseText || "{}");
                const url = res.secure_url || res.url;
                if (xhr.status >= 200 && xhr.status < 300 && url) return resolve(url);
                reject(new Error(res.error?.message || "Upload ảnh thất bại (Cloudinary)."));
            } catch {
                reject(new Error("Response Cloudinary không hợp lệ."));
            }
        };

        xhr.onerror = () => reject(new Error("Lỗi mạng khi upload ảnh."));
        xhr.send(form);
    });
};
