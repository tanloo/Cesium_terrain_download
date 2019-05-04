package com.cesium.demo.utils;

import org.apache.commons.lang3.ArrayUtils;
import org.springframework.util.ClassUtils;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.Set;

/**
 * @author tanloo
 * on 2019/4/16
 */
public class ImgOps {
    public static String mergeImg(Set<String> imgPaths) throws Exception {
        String[] str_imgPaths = imgPaths.toArray(new String[imgPaths.size()]);
        System.out.println("有" + str_imgPaths.length + "份数据");
        URL url = ClassUtils.getDefaultClassLoader().getResource("static/gdal_merge.py");
        String imgMerge_pyPath = new File(url.getPath()).getAbsolutePath();
        String[] temp = {"cmd", "/c", "python", imgMerge_pyPath};
        String[] mergeCommand = ArrayUtils.addAll(temp, str_imgPaths);
        System.out.println("-----开始合并img文件-------");
        Process pr = Runtime.getRuntime().exec(mergeCommand);
        pr.waitFor();
        int stat = pr.exitValue();
        if (stat == 0) {
            pr.destroy();
            System.out.println("-----合并img文件完成-------");
            for (String singleImg : imgPaths) {
                new File(singleImg).delete();
            }
            String imgPath = System.getProperty("user.dir") + "\\out.tif";
            File outImg = new File(imgPath);
            if (outImg.exists()) {
                return imgPath;
            } else {
                throw new Exception("-----合并img文件完成，但未找到合并后文件！-------");
            }
        } else {
            throw new Exception("-----合并img文件失败-------");
        }
    }

    public static void img2terrain(String imgPath, Integer tileLevel) throws Exception {
        URL url = ClassUtils.getDefaultClassLoader().getResource("static/gdal2srtmtiles.py");
        String pyPath = new File(url.getPath()).getAbsolutePath();
        url = ClassUtils.getDefaultClassLoader().getResource("static");
        File staticFile = new File(url.getFile());
        String tilePath = "";
        for (File f : staticFile.listFiles()) {
            if ("terrain_tiles".equals(f.getName())) {
                if (f.isDirectory()) {
                    tilePath = f.getAbsolutePath();
                    File tileFile = new File(tilePath);
                    if (tileFile.listFiles() != null) {
                        FileOps.deleteFiles(tilePath);
                    }
                    break;
                }
            }
        }
        if (tilePath.length() == 0) {
            File tempFile = new File(staticFile.getAbsolutePath() + "/terrain_tiles");
            boolean flag = tempFile.mkdir();
            if (!flag) {
                throw new Exception("创建切片文件夹失败，请检查权限");
            }
            tilePath = tempFile.getAbsolutePath();
        }

        System.out.println(imgPath);
        String str_tileLevel = "0-" + String.valueOf(tileLevel);
        System.out.println(str_tileLevel);
        String[] tilesCommand = {"cmd", "/c", "python", pyPath, pyPath, "--cesium", "--resume", "-z", str_tileLevel, "-p", "geodetic", imgPath, tilePath};
        System.out.println("-------开始执行转换terrain-------");
        Process pr2 = Runtime.getRuntime().exec(tilesCommand);
        pr2.waitFor();
        int stat2 = pr2.exitValue();
        if (stat2 == 0) {
            System.out.println("-------terrain生成成功-------");
            String s = "D:\\Administrator\\Desktop\\11ww\\terrain\\覆盖至生成tiles结果";
            try {
                FileOps.copyDir(s, tilePath);
            } catch (IOException e) {
                e.printStackTrace();
            }
            //不删除合并的影像
            // new File(imgPath).delete();

            pr2.destroy();
        } else {
            System.out.println("-------terrain生成失败-------");
        }
    }
}
