package com.cesium.demo.controller;

import org.apache.commons.lang3.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.*;

/**
 * @author tanloo
 * on 2019/4/17
 */
@RestController
public class FileController {
    @PostMapping("/download")
    public String download(HttpServletResponse response, @RequestBody String fileName) {

        try {
            //去除传过来的文件名末尾的异常字符
            fileName = fileName.substring(0, fileName.lastIndexOf("zip") + 3);
            String path = "F:\\DEM\\";
            File file = new File(path + fileName);
            if (file.exists()) {
                response.setCharacterEncoding("utf-8");
                response.setContentType("application/octet-stream");
                response.setHeader("Content-Disposition", "attachment;fileName=" + fileName);
                byte[] buffer = new byte[1024];
                try (FileInputStream fis = new FileInputStream(file);
                     BufferedInputStream bis = new BufferedInputStream(fis);
                     OutputStream outputStream = response.getOutputStream();
                ) {
                    int i = bis.read(buffer);
                    while (i != -1) {
                        outputStream.write(buffer, 0, i);
                        i = bis.read(buffer);
                    }
                    return "success";
                } catch (Exception e) {
                    e.printStackTrace();
                    return "error";
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "error";
        }
        return "error";
    }
}
