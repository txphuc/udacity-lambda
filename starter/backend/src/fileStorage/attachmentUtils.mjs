const bucketName = process.env.S3_BUCKET

export const getAttachmentUrl = (todoId) => {
    return `https://${bucketName}.s3.amazonaws.com/${todoId}`
}