package com.cesium.demo.controller;

import org.apache.commons.lang3.ArrayUtils;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.*;

/**
 * @author tanloo
 * on 2019/4/17
 */
@RestController
public class FileController {
    @GetMapping("/downloadSourceImg")
    public String download(HttpServletResponse response, @RequestParam String fileName) {

        try {
            //去除传过来的文件名末尾的异常字符
            fileName = fileName.substring(0, fileName.lastIndexOf("zip") + 3);
            String path = "F:\\DEM\\";
            File file = new File(path + fileName);
            if (file.exists()) {
                download(response, file, fileName);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "error";
        }
        return "success";
    }

    @GetMapping("/downloadClipImg")
    public String downloadClipImg(HttpServletResponse response, @RequestParam String xMin, @RequestParam String yMin, @RequestParam String xMax, @RequestParam String yMax) throws Exception {
        if (xMin == null || xMax == null || yMin == null || yMax == null) {
            return "error";
        }
        String sourceImgPath = System.getProperty("user.dir") + "\\out.tif";
        if (!new File(sourceImgPath).exists()) {
            return "lost";
        }
        String targetImgPath = System.getProperty("user.dir") + "\\clip.tif";
        if (new File(targetImgPath).exists()) {
            new File(targetImgPath).delete();
        }
        //调用gdalwarp库，直接命令行进行裁剪
        //gdalwarp -te xMin yMin xMax yMax -of GTiff sourceTifPath targetTifPath
        String[] coordsStr = {xMin, yMin, xMax, yMax, "-of", "GTiff", sourceImgPath, targetImgPath};
        String[] clipCommand = {"gdalwarp", "-te"};
        clipCommand = ArrayUtils.addAll(clipCommand, coordsStr);
        System.out.println("-----开始裁剪img文件-------");
        Process pr = Runtime.getRuntime().exec(clipCommand);
        pr.waitFor();
        int stat = pr.exitValue();
        if (stat == 0) {
            System.out.println("-----裁剪img文件完成-------");
            File outImg = new File(targetImgPath);
            if (outImg.exists()) {
                download(response, outImg, "clipImg.tif");
            } else {
                throw new Exception("-----裁剪img文件完成，但未找到裁剪后文件！-------");
            }
        } else {
            throw new Exception("-----裁剪img文件失败-------");
        }
        return "success";
    }

    private void download(HttpServletResponse response, File file, String fileName) {
        response.setHeader("content-type", "application/octet-stream");
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
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
