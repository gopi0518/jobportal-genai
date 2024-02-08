import http from "./http-common";

class UploadFilesService {
  upload(url,file,userid) {
    let formData = new FormData();

    formData.append("file", file);
    formData.append("userid", userid);
    return http.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    });
  }

  /*getFiles() {
    return http.get("/resume/files");
  }*/
}

export default new UploadFilesService();