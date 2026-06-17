import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  documentUploader: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 5 },
    image: { maxFileSize: "8MB", maxFileCount: 5 },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      maxFileSize: "16MB",
      maxFileCount: 5,
    },
    "application/vnd.ms-excel": { maxFileSize: "16MB", maxFileCount: 5 },
    "text/csv": { maxFileSize: "8MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete:", file.name);
      return { fileUrl: file.ufsUrl, fileName: file.name, fileSize: file.size };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
