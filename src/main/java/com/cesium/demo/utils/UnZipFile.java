package com.cesium.demo.utils;

import java.io.*;
import java.util.HashSet;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * @author tanloo
 * on 2019/4/13
 */
public class UnZipFile {

    public static Set<String> unZipFile(Set<String> zipPackages) throws Exception {
        //String zipPackage = "F:/ASTGTM_N11E076.zip";
        Set<String> imgPaths = new HashSet<>();
        for (String zipPackage : zipPackages) {
            if ("zip".equals(zipPackage.substring(zipPackage.lastIndexOf('.')))) {
                continue;
            }
            String fileToBeExtracted = zipPackage.substring(zipPackage.lastIndexOf('\\') + 1, zipPackage.lastIndexOf('.')) + "_dem.tif";
            String outPath = zipPackage.substring(0, zipPackage.lastIndexOf('\\') + 1) + "temp\\" + fileToBeExtracted;
            File outFile = new File(outPath.substring(0, outPath.lastIndexOf('\\')));
            if (!outFile.exists()) {
                outFile.mkdir();
            }

            OutputStream out = new FileOutputStream(outPath);
            FileInputStream fileInputStream = new FileInputStream(zipPackage);
            BufferedInputStream bufferedInputStream = new BufferedInputStream(fileInputStream);
            ZipInputStream zin = new ZipInputStream(bufferedInputStream);
            ZipEntry ze = null;
            while ((ze = zin.getNextEntry()) != null) {
                if (ze.getName().equals(fileToBeExtracted)) {
                    byte[] buffer = new byte[9000];
                    int len;
                    while ((len = zin.read(buffer)) != -1) {
                        out.write(buffer, 0, len);
                    }
                    out.close();
                    break;
                }
            }
            fileInputStream.close();
            bufferedInputStream.close();
            zin.close();
            imgPaths.add(outPath);
        }
        return imgPaths;
    }
}
