import {v2 as cloudinary} from "cloudinary";

/**
 * Uploads an image File to Cloudinary and returns the secure URL.
 * Used by the create/edit event server actions and the events API routes.
 */
export async function uploadEventImage(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{secure_url: string}>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {resource_type: "image", folder: "DevEvent"},
            (error, results) => {
                if (error) return reject(error);
                resolve(results as {secure_url: string});
            }
        ).end(buffer);
    });

    return uploadResult.secure_url;
}
