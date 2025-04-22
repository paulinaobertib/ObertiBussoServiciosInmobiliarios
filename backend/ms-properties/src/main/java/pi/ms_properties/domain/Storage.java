package pi.ms_properties.domain;

import lombok.Data;

import java.io.InputStream;

// es la clase para poder administrar las imagenes de blob
// empaquetamos toda la informacion que necesita blob
@Data
public class Storage {
    private String path;
    private String fileName;
    // leemos los datos del archivo en forma secuencial y enviamos esos datos a blob
    InputStream inputStream;
    private String contentType;
    private long size;
}
