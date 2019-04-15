package com.cesium.demo.controller;

import com.cesium.demo.mapper.CodeMapper;
import com.cesium.demo.pojo.Code;
import com.cesium.demo.utils.FileOps;
import com.cesium.demo.utils.UnZipFile;
import org.apache.commons.lang3.ArrayUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.net.URL;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

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
        Set<String> zipPaths = new HashSet<>();

        for (Long id : codes) {
            Code code = this.codeMapper.getOne(id);
            if (code != null) {
                if (new File(code.getPath()).exists()) {
                    map.put(id, code);
                    zipPaths.add(code.getPath());
                }
            }
        }
        try {
            System.out.println("-----开始提取img文件-------");
            Set<String> imgPaths = UnZipFile.unZipFile(zipPaths);
            String[] str_imgPaths = (String[]) imgPaths.toArray(new String[imgPaths.size()]);
            System.out.println("有" + str_imgPaths.length + "份数据");
            URL url = this.getClass().getResource("/static/gdal_merge.py");
            String imgMerge_pyPath = new File(url.getPath()).getAbsolutePath();
            String[] temp = {"cmd", "/c", "python", imgMerge_pyPath};
            String[] mergeCommand = ArrayUtils.addAll(temp, str_imgPaths);
            System.out.println("-----开始合并img文件-------");
            Process pr = Runtime.getRuntime().exec(mergeCommand);
            pr.waitFor();
            int stat = pr.exitValue();
            if (stat == 0) {
                System.out.println("-----合并img文件完成-------");
                for (String singleImg : imgPaths) {
                    new File(singleImg).delete();
                }
                url = this.getClass().getResource("/static/gdal2srtmtiles.py");
                String pyPath = new File(url.getPath()).getAbsolutePath();
                url = this.getClass().getResource("/static");
                File staticFile = new File(url.getFile());
                String tilePath = "";
                for (File f : staticFile.listFiles()) {
                    if ("terrain_tiles".equals(f.getName())) {
                        if (f.isDirectory()) {
                            tilePath = f.getAbsolutePath();
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

                File tileFile = new File(tilePath);
                if (tileFile.listFiles() != null) {
                    FileOps.deleteFiles(tilePath);
                }
                //System.out.println(System.getProperty("user.dir"));
                //url = this.getClass().getResource("/static/out.tif");
                String imgPath = System.getProperty("user.dir") + "/out.tif";
                System.out.println(imgPath);
                String[] tilesCommand = {"cmd", "/c", "python", pyPath, pyPath, "--cesium", "--resume", "-z", "0-8", "-p", "geodetic", imgPath, tilePath};
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
                    new File(imgPath).delete();
                } else {
                    System.out.println("-------terrain生成失败-------");
                }
            } else {
                System.out.println("-------合并img文件失败-------");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        /*for (Code code : map.values()) {
            String zipPath = code.getPath();
            if (zipPath != null) {
                File zipFile = new File(zipPath);
                if (zipFile.exists()) {
                    try {
                        URL url = this.getClass().getResource("/static/gdal2srtmtiles.py");
                        String pyPath = new File(url.getPath()).getAbsolutePath();
                        url = this.getClass().getResource("/static/terrain_tiles");
                        String tilePath = new File(url.getPath()).getAbsolutePath() + "/" + code.getId();
                        File tileFile = new File((tilePath));
                        if (!tileFile.exists()) {
                            boolean flag = tileFile.mkdir();
                            if (!flag) {
                                throw new Exception("创建文件夹失败，请检查权限");
                            }
                        } else {
                            if (tileFile.listFiles() != null) {
                                System.out.println("terrain地形文件已存在，跳过重新读取");
                                continue;
                            }
                        }
                        System.out.println("-------开始提取DEM文件---------");
                        String imgPath = UnZipFile.unZipFile(zipPath);
                        if (imgPath.length() == 0) {
                            System.out.println("---------未能提取DEM文件！-------");
                            break;
                        }
                        System.out.println(imgPath);
                        System.out.println("-------开始执行转换terrain-------");
                    *//*    else {
                            if (tileFile.isDirectory()) {
                                File[] fs = tileFile.listFiles();
                                if (fs != null) {
                                    for (File singleFile : fs) {
                                        boolean flag = singleFile.delete();
                                        if (!flag) {
                                            throw new Exception("删除文件失败，请检查权限");
                                        }
                                    }
                                }
                            }
                        }*//*
                        System.out.println(pyPath);
                        System.out.println(tilePath);

                        String[] command = {"cmd", "/c", "python", pyPath, pyPath, "--cesium", "--resume", "-z", "0-10", "-p", "geodetic", imgPath, tilePath};
                        Process pr = Runtime.getRuntime().exec(command);

                        pr.waitFor();
                        int stat = pr.exitValue();
                        if (stat == 0) {
                            System.out.println("-------terrain生成成功-------");
                            String s = "D:\\Administrator\\Desktop\\11ww\\terrain\\覆盖至生成tiles结果";
                            try {
                                FileOps.copyDir(s, tilePath);
                            } catch (IOException e) {
                                e.printStackTrace();
                            }
                            new File(imgPath).delete();
                        } else {
                            System.out.println("-------terrain生成失败-------");
                        }
                    } catch (Exception e) {
                        System.out.println(e.toString());
                    }

                }
            }
        }*/
        return map;
    }
}
