package com.cesium.demo.controller;

import com.cesium.demo.mapper.CodeMapper;
import com.cesium.demo.pojo.Code;
import com.cesium.demo.utils.CopyFiles;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

/**
 * @author tanloo
 * on 2019/4/3
 */
@RestController
@RequestMapping("/code")
public class CodeController {

    private final CodeMapper codeMapper;

    @Autowired
    public CodeController(CodeMapper codeMapper) {
        this.codeMapper = codeMapper;
    }

    @PostMapping
    public Object getCodesInfo(@RequestBody Long[] codes) {
        Map<Long, Code> map = new HashMap<>(codes.length);
        for (Long id : codes) {
            Code code = this.codeMapper.getOne(id);
            if (code != null) {
                map.put(id, code);
            }

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
                        String tilePath = new File(url.getPath()).getAbsolutePath() + "/" + ((Code) code).getId();
                        File tileFile = new File((tilePath));
                        if (!tileFile.exists()) {
                            boolean flag = tileFile.mkdir();
                            if (!flag) {
                                throw new Exception("创建文件夹失败，请检查权限");
                            }
                        } else {
                            if (tileFile.isDirectory()) {
                                File[] fs = tileFile.listFiles();
                                if (fs != null) {
                                    for (File singleFile : fs) {
                                        boolean flag = singleFile.delete();
                                        if (!flag) {
                                            throw new Exception("创建文件夹失败，请检查权限");
                                        }
                                    }
                                }

                            }
                        }
                        System.out.println(pyPath);
                        System.out.println(tilePath);

                        String cmd = "cmd /c python " + pyPath + " " + pyPath + " --cesium --resume -z 0-10 -p geodetic F:\\Cesium\\terrain\\ASTGTM_N01E127_dem.tif " + tilePath;

                        System.out.println(cmd);
                        Process pr = Runtime.getRuntime().exec(cmd);

                        pr.waitFor();
                        int stat = pr.exitValue();
                        if (stat == 0) {
                            System.out.println("执行成功");
                            String s = "D:\\Administrator\\Desktop\\11ww\\terrain\\覆盖至生成tiles结果";
                            try {
                                CopyFiles.copyDir(s, tilePath);
                            } catch (IOException e) {
                                e.printStackTrace();
                            }
                        } else {
                            System.out.println("执行失败");
                        }
                    } catch (Exception e) {
                        System.out.println(e.toString());
                    }

                }
            }
        }
        return map;
    }
}
