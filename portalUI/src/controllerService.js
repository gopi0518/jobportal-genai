import http from "./http-common";

class ControllerService {
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

  listprofiles(url) {
    return http.get(url, {
    });
  }

  /*getFiles() {
    return http.get("/resume/files");
  }*/
}

export default new ControllerService();