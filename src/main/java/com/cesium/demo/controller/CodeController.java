package com.cesium.demo.controller;

import com.cesium.demo.dao.CodeDao;
import com.cesium.demo.pojo.Code;
import com.cesium.demo.utils.CopyFiles;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.util.ResourceUtils;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * @author tanloo
 * on 2019/4/3
 */
@RestController
@RequestMapping("/code")
public class CodeController {

    @Autowired
    private CodeDao codeDao;

    @PostMapping
    public Object getCodesInfo(@RequestBody Long[] codes) {
        Map map = new HashMap<Long, Code>(codes.length);
        for (int i = 0, il = codes.length; i < il; i++) {
            Optional<Code> code = this.codeDao.findById(codes[i]);
            map.put(codes[i], code.orElse(new Code()));
        }
        for (Object code : map.values()) {
            String path = ((Code) code).getPath();
            if (path != null) {
                File f = new File(path);
                if (f.exists()) {
                    try {
                        System.out.println("开始执行转换terrain");
                        URL url = this.getClass().getResource("/static/gdal2srtmtiles.py");
                        String pyPath = new File(url.getPath()).getAbsolutePath();
                        url = this.getClass().getResource("/static/terrain_tiles");
                        String tilePath = new File(url.getPath()).getAbsolutePath();
                        System.out.println(pyPath);
                        System.out.println(tilePath);
                        File tileFile = new File(tilePath);
                        if (tileFile.isDirectory()) {
                            File[] fs = tileFile.listFiles();
                            for (File singleFile : fs) {
                                singleFile.delete();
                            }
                        }
                        //String cmd = "python" + pyPath + " " + pyPath + " --cesium --resume -z 0-10 -p geodetic F:\\Cesium\\terrain\\ASTGTM_N01E127_dem.tif " + tilePath;
                        String cmd = "cmd /c python " + pyPath + " " + pyPath + " --cesium --resume -z 0-10 -p geodetic F:\\Cesium\\terrain\\ASTGTM_N01E127_dem.tif " + tilePath;

                        System.out.println(cmd);
                        Process pr = Runtime.getRuntime().exec(cmd);

                        pr.waitFor();
                        int stat = pr.exitValue();
                        if (stat == 0) {
                            System.out.println("执行成功");
                            String s = "D:\\Administrator\\Desktop\\11ww\\terrain\\覆盖至生成tiles结果";
                            String d = tilePath.toString();
                            try {
                                CopyFiles.copyDir(s, d);
                            } catch (IOException e) {
                                e.printStackTrace();
                            }
                        } else {
                            System.out.println("执行失败");
                        }
                    } catch (Exception e) {
                        System.out.println(e);
                    }

                }
            }
            System.out.println(((Code) code).getPath());
        }
        return map;
    }
}
